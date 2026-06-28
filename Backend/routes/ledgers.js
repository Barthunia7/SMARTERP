const express = require('express');
const router = express.Router();
const pool = require('../db'); // Reuse central db instance to save memory connections
const auth = require('../middleware/auth');

// 1. CREATE A LEDGER (Optimized fallback for base NeonDB schemas)
router.post('/', auth, async (req, res) => {
  const { company_id, name, group_type, opening_balance, gstin, state } = req.body;
  
  if (!name || !group_type || !company_id) {
    return res.status(400).json({ error: "Name, group_type, and company_id fields are strictly required." });
  }

  try {
    // 🟩 Removed current_balance column dependency entirely from this insert statement
    const newLedger = await pool.query(
      `INSERT INTO ledgers (company_id, name, group_type, opening_balance, gstin, state) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [company_id, name, group_type, opening_balance || 0.00, gstin, state]
    );
    res.status(201).json({ message: "Ledger created successfully!", ledger: newLedger.rows });
  } catch (err) {
    console.error("❌ NeonDB Insert Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// 2. GET ALL LEDGERS FOR A SPECIFIC COMPANY
router.get('/:companyId', auth, async (req, res) => {
  const { companyId } = req.params;
  try {
    const companyLedgers = await pool.query(
      'SELECT * FROM ledgers WHERE company_id = $1 ORDER BY name ASC', 
      [companyId]
    );
    res.json(companyLedgers.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
