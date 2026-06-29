const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🟩 DAY 9: FETCH & SEARCH LEDGERS FOR AUTOCOMPLETE DROPDOWNS
router.get('/api/ledgers-search/:company_id', async (req, res) => {
  const { company_id } = req.params;
  const { q } = req.query; // Capture typing query parameters

  try {
    let queryText = `
      SELECT id, name, group_type, current_balance 
      FROM ledgers 
      WHERE company_id = $1
    `;
    let queryParams = [company_id];

    // If the user has typed characters, filter records via an intense fuzzy text-match lookup
    if (q && q.trim() !== '') {
      queryText += ` AND name ILIKE $2`;
      queryParams.push(`%${q.trim()}%`);
    }

    queryText += ` ORDER BY name ASC LIMIT 10`; // Limit to top 10 rows for ultra-fast response

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
