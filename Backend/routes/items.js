const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. CREATE A STOCK ITEM
router.post('/', auth, async (req, res) => {
  const { name, sku, purchase_price, selling_price, quantity, gst_percentage, unit } = req.body;

  if (!name || !sku) {
    return res.status(400).json({ error: "Item Name and SKU are required fields." });
  }

  try {
    const newItem = await pool.query(
      `INSERT INTO items (user_id, name, sku, purchase_price, selling_price, quantity, gst_percentage, unit) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, name, sku, purchase_price || 0, selling_price || 0, quantity || 0, gst_percentage || 0, unit || 'PCS']
    );
    res.status(201).json({ message: "Stock item created successfully!", item: newItem.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET ALL STOCK ITEMS
router.get('/', auth, async (req, res) => {
  try {
    const userItems = await pool.query('SELECT * FROM items WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(userItems.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
