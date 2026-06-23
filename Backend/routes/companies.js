const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. CREATE A COMPANY (With strict 5-company limit check)
router.post('/', auth, async (req, res) => {
  const { company_name, address, gst_number, financial_year, state, contact_information } = req.body;

  // Validation: Check for required fields
  if (!company_name || !address || !gst_number || !financial_year || !state || !contact_information) {
    return res.status(400).json({ error: "All company fields are strictly required." });
  }

  try {
    // Enforcement: Check if the user has already reached their maximum limit of 5 companies
const existingCompanies = await pool.query('SELECT COUNT(*) FROM companies WHERE user_id = $1', [req.user.id]);
const companyCount = parseInt(existingCompanies.rows[0].count);


    if (companyCount >= 5) {
      return res.status(400).json({ error: "Limitation error: Each account can manage a maximum of 5 companies." });
    }

    // Insert the new company into the database
    const newCompany = await pool.query(
      `INSERT INTO companies (user_id, company_name, address, gst_number, financial_year, state, contact_information) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, company_name, address, gst_number, financial_year, state, contact_information]
    );

    res.status(201).json({ message: "Company profile created successfully!", company: newCompany.rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. SELECT/GET EXISTING COMPANIES FOR THE LOGGED-IN USER
router.get('/', auth, async (req, res) => {
  try {
    const userCompanies = await pool.query('SELECT * FROM companies WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(userCompanies.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
