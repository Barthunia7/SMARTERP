const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🟩 DAY 10: AUTOCOMPLETE SEARCH FOR STOCK ITEMS
router.get('/api/stock-items-search/:company_id', async (req, res) => {
  const { company_id } = req.params;
  const { q } = req.query;

  try {
    let queryText = `
      SELECT id, name, sku, selling_price, quantity 
      FROM stock_items 
      WHERE company_id = $1
    `;
    let queryParams = [company_id];

    if (q && q.trim() !== '') {
      queryText += ` AND name ILIKE $2`;
      queryParams.push(`%${q.trim()}%`);
    }

    queryText += ` ORDER BY name ASC LIMIT 10`;

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
