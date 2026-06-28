const pool = require('./db');

async function runMigration() {
  try {
    console.log("Connecting to Neon Cloud Database...");
    
    // Create the ledgers table 
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
    
    console.log("🚀 Day 6 Migration Complete: 'ledgers' table is ready in NeonDB!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();
