const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. CREATE A LEDGER
router.post('/', auth, async (req, res) => {
  const { name, group_type, phone, email, opening_balance } = req.body;
  
  if (!name || !group_type) {
    return res.status(400).json({ error: "Name and group_type fields are strictly required." });
  }

  try {
    const newLedger = await pool.query(
      `INSERT INTO ledgers (user_id, name, group_type, phone, email, opening_balance) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, name, group_type, phone, email, opening_balance || 0.00]
    );
    res.status(201).json({ message: "Ledger created successfully!", ledger: newLedger.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET ALL LEDGERS FOR LOGGED IN USER
router.get('/', auth, async (req, res) => {
  try {
    const userLedgers = await pool.query('SELECT * FROM ledgers WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(userLedgers.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
