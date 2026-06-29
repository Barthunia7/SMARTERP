const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🟩 FOOLPROOF SEEDING ENDPOINT: INJECT BASE ACCOUNTING LEDGERS
router.get('/api/seed-ledgers', async (req, res) => {
  try {
    const baseLedgers = [
      { name: 'Cash In Hand', group_type: 'Cash-in-hand', bal: 50000.00 },
      { name: 'State Bank of India', group_type: 'Bank Accounts', bal: 250000.00 },
      { name: 'Capital Account', group_type: 'Capital Account', bal: 300000.00 },
      { name: 'Office Rent Expense', group_type: 'Indirect Expenses', bal: 0.00 },
      { name: 'Electricity Charges', group_type: 'Indirect Expenses', bal: 0.00 },
      { name: 'Sales Account', group_type: 'Sales Accounts', bal: 0.00 },
      { name: 'Purchase Account', group_type: 'Purchase Accounts', bal: 0.00 }
    ];

    console.log("Seeding core accounts into Neon Cloud Database with safe pre-checks...");

    for (let ledger of baseLedgers) {
      // 1. Manually look up if this account name already exists for company 1
      const checkExist = await pool.query(
        'SELECT id FROM ledgers WHERE company_id = $1 AND name = $2',
        [1, ledger.name]
      );

      // 2. Only insert if the record is completely missing
      if (checkExist.rows.length === 0) {
        await pool.query(
          `INSERT INTO ledgers (company_id, name, group_type, opening_balance, current_balance, state)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [1, ledger.name, ledger.group_type, ledger.bal, ledger.bal, 'Delhi']
        );
      }
    }

    res.json({ message: "Success! Standard accounting ledger data successfully seeded into NeonDB." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
