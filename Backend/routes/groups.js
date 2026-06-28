const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// 1. POST: Create a new custom accounting group
router.post('/', auth, async (req, res) => {
  const { company_id, name, parent_group } = req.body;
  if (!name || !company_id) {
    return res.status(400).json({ error: "Group name and company_id are required fields." });
  }
  try {
    const newGroup = await pool.query(
      `INSERT INTO accounting_groups (company_id, name, parent_group) 
       VALUES ($1, $2, $3) RETURNING *`,
      [company_id, name, parent_group || 'Primary']
    );
    res.status(201).json({ message: "Accounting Group created!", group: newGroup.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: "This group name already exists for your company." });
    }
    res.status(500).json({ error: err.message });
  }
});

// 2. GET: List all groups (With automatic default seeding fallback)
router.get('/:companyId', auth, async (req, res) => {
  const { companyId } = req.params;
  try {
    // Check if groups exist for this company
    let result = await pool.query(
      `SELECT * FROM accounting_groups WHERE company_id = $1 ORDER BY name ASC`,
      [companyId]
    );

    // 🟩 SEEDING FALLBACK: If table is empty, automatically inject standard options
    if (result.rows.length === 0) {
      const defaultGroups = [
        'Sundry Debtors', 
        'Sundry Creditors', 
        'Purchase Accounts', 
        'Sales Accounts', 
        'Direct Expenses', 
        'Indirect Expenses'
      ];

      for (const groupName of defaultGroups) {
        await pool.query(
          `INSERT INTO accounting_groups (company_id, name, parent_group) 
           VALUES ($1, $2, 'Primary') ON CONFLICT DO NOTHING`,
          [companyId, groupName]
        );
      }

      // Re-query newly inserted groups
      result = await pool.query(
        `SELECT * FROM accounting_groups WHERE company_id = $1 ORDER BY name ASC`,
        [companyId]
      );
    }

    return res.json(result.rows);
  } catch (err) {
    console.error("Group Fetch/Seed Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});


module.exports = router;
