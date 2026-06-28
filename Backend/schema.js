
require('dotenv').config();
const pool = require('./db');


async function runMigration() {
  try {
    console.log("Connecting to Neon Cloud Database...");

    // 1. Create the ledgers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ledgers (
        id SERIAL PRIMARY KEY,
        company_id INT REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        group_type VARCHAR(100) NOT NULL, -- 'Sundry Debtors' or 'Sundry Creditors'
        opening_balance NUMERIC(15, 2) DEFAULT 0.00,
        current_balance NUMERIC(15, 2) DEFAULT 0.00,
        gstin VARCHAR(15),
        state VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_company_ledger UNIQUE (company_id, name)
      );
    `);

    // 🟩 2. DAY 8 MIGRATION: Create the Units of Measure (UOM) table safely
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uoms (
        id SERIAL PRIMARY KEY,
        company_id INT NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        formal_name VARCHAR(50),
        CONSTRAINT unique_company_uom UNIQUE (company_id, symbol)
      );
    `);

    // 🟩 3. DAY 8 MIGRATION: Create the Stock Items table safely
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_items (
        id SERIAL PRIMARY KEY,
        company_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        sku VARCHAR(50),
        purchase_price NUMERIC(12, 2) DEFAULT 0.00,
        selling_price NUMERIC(12, 2) DEFAULT 0.00,
        quantity INT DEFAULT 0,
        gst_percentage NUMERIC(5, 2) DEFAULT 0.00,
        uom_id INT REFERENCES uoms(id) ON DELETE SET NULL,
        CONSTRAINT unique_company_stock_name UNIQUE (company_id, name),
        CONSTRAINT unique_company_stock_sku UNIQUE (company_id, sku)
      );
    `);

    console.log("🚀 Day 8 Migration Complete: 'uoms' and 'stock_items' tables are ready in NeonDB!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();
