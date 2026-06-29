const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/api/vouchers', async (req, res) => {
    const { company_id, voucher_number, voucher_type, date, narration, entries, inventory_items } = req.body;

    // 1. Validation Check: Debits must match Credits exactly
    let totalDebit = 0;
    let totalCredit = 0;
    entries.forEach(item => {
        if (item.entry_type === 'DR') totalDebit += parseFloat(item.amount);
        if (item.entry_type === 'CR') totalCredit += parseFloat(item.amount);
    });

    if (totalDebit.toFixed(2) !== totalCredit.toFixed(2)) {
        return res.status(400).json({ error: `Unbalanced Voucher! DR (${totalDebit}) must equal CR (${totalCredit}).` });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 2. Insert Parent Voucher Header Row
        const voucherRes = await client.query(
            `INSERT INTO vouchers (company_id, voucher_number, voucher_type, date, narration) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [company_id, voucher_number, voucher_type.toUpperCase(), date || new Date(), narration]
        );
        const voucherId = voucherRes.rows[0].id;

        // 3. Insert Accounting Ledger Split Rows
        for (let item of entries) {
            await client.query(
                `INSERT INTO voucher_entries (voucher_id, ledger_id, entry_type, amount) 
         VALUES ($1, $2, $3, $4)`,
                [voucherId, item.ledger_id, item.entry_type, item.amount]
            );

            // Adjust ledger accounts running balances pool
            const dynamicDelta = item.entry_type === 'DR' ? item.amount : -item.amount;
            await client.query(
                `UPDATE ledgers SET current_balance = current_balance + $1 WHERE id = $2`,
                [dynamicDelta, item.ledger_id]
            );
        }

        // 🟩 4. DAY 10 AUTOMATIC INVENTORY STOCK-DEDUCTION LOGIC FOR SALES
        const typeUpper = voucher_type.toUpperCase(); //
        if (typeUpper === 'SALES' && inventory_items && inventory_items.length > 0) {

            for (let item of inventory_items) {
                // Log individual item rows inside our new split table
                await client.query(
                    `INSERT INTO voucher_inventory_items (voucher_id, stock_item_id, quantity, rate) 
           VALUES ($1, $2, $3, $4)`,
                    [voucherId, item.stock_item_id, item.quantity, item.rate]
                );

                // 📉 Automatically DECREASE available inventory item count for items sold
                await client.query(
                    `UPDATE stock_items 
           SET quantity = quantity - $1 
           WHERE id = $2`,
                    [item.quantity, item.stock_item_id]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "Sales Voucher saved and inventory stock auto-deducted successfully!" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;
