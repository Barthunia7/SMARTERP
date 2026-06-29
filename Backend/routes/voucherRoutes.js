const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a double-entry transaction voucher
router.post('/api/vouchers', async (req, res) => {
  const { company_id, voucher_number, voucher_type, date, narration, entries } = req.body;
  
  // Validation Check: Balance Verification Loop
  let totalDebit = 0;
  let totalCredit = 0;
  
  entries.forEach(item => {
    if (item.entry_type === 'DR') totalDebit += parseFloat(item.amount);
    if (item.entry_type === 'CR') totalCredit += parseFloat(item.amount);
  });

  if (totalDebit.toFixed(2) !== totalCredit.toFixed(2)) {
    return res.status(400).json({ error: `Unbalanced Voucher Array! DR (${totalDebit}) must equal CR (${totalCredit}).` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert Voucher Parent Header row
    const voucherRes = await client.query(
      `INSERT INTO vouchers (company_id, voucher_number, voucher_type, date, narration) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [company_id, voucher_number, voucher_type.toUpperCase(), date || new Date(), narration]
    );
    const voucherId = voucherRes.rows[0].id;

    // 2. Process ledger balances
    for (let item of entries) {
      await client.query(
        `INSERT INTO voucher_entries (voucher_id, ledger_id, entry_type, amount) 
         VALUES ($1, $2, $3, $4)`,
        [voucherId, item.ledger_id, item.entry_type, item.amount]
      );

      // Adjust dynamic financial ledger balance pools based on entry mapping type
      const dynamicDelta = item.entry_type === 'DR' ? item.amount : -item.amount;
      await client.query(
        `UPDATE ledgers SET current_balance = current_balance + $1 WHERE id = $2`,
        [dynamicDelta, item.ledger_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: "Accounting voucher logged cleanly!" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
