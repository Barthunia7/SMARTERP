const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// Create Stock Item
router.post('/api/stock-items', async (req, res) => {
  const { company_id, name, sku, purchase_price, selling_price, quantity, gst_percentage, uom_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO stock_items (company_id, name, sku, purchase_price, selling_price, quantity, gst_percentage, uom_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [company_id, name, sku, purchase_price || 0, selling_price || 0, quantity || 0, gst_percentage || 0, uom_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: "Item name or SKU already exists." });
    res.status(500).json({ error: err.message });
  }
});
// 🟩 DAY 8: ADD THIS MISSING ROUTE TO SAVE NEW UOM UNITS
router.post('/api/uoms', async (req, res) => {
  const { company_id, symbol, formal_name } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO uoms (company_id, symbol, formal_name) 
       VALUES ($1, $2, $3) RETURNING *`,
      [company_id, symbol, formal_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: "UOM unit symbol already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get all UOM entries for a specific company
router.get('/api/uoms/:company_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, symbol FROM uoms WHERE company_id = $1 ORDER BY symbol ASC',
      [req.params.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all stock items along with UOM symbols for Dashboard
router.get('/api/stock-dashboard/:company_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.sku, s.purchase_price, s.selling_price, s.quantity, s.gst_percentage, u.symbol as uom
       FROM stock_items s
       LEFT JOIN uoms u ON s.uom_id = u.id
       WHERE s.company_id = $1
       ORDER BY s.name ASC`,
      [req.params.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
