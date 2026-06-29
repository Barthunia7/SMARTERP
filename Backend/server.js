const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); 
require('dotenv').config();

const authMiddleware = require('./middleware/auth');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🟩 UPDATED AUTOMATIC DATABASE STRUCTURAL SYNC FOR DAY 8
const syncDatabaseSchema = async () => {
  try {
    console.log("Checking NeonDB schema compliance...");
    await pool.query(`ALTER TABLE ledgers DROP CONSTRAINT IF EXISTS ledgers_group_type_check;`);

    // 1. Create Ledgers Table Safely
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ledgers (
        id SERIAL PRIMARY KEY,
        company_id INT REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        group_type VARCHAR(100) NOT NULL,
        opening_balance NUMERIC(15, 2) DEFAULT 0.00,
        CONSTRAINT unique_company_ledger UNIQUE (company_id, name)
      );
    `);
   
    // Inject missing columns
    await pool.query(`ALTER TABLE ledgers ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Delhi';`);
    await pool.query(`ALTER TABLE ledgers ADD COLUMN IF NOT EXISTS gstin VARCHAR(15);`);
    await pool.query(`ALTER TABLE ledgers ADD COLUMN IF NOT EXISTS current_balance NUMERIC(15, 2) DEFAULT 0.00;`);
    
    // 2. DAY 7: Accounting Groups Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounting_groups (
        id SERIAL PRIMARY KEY,
        company_id INT REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        parent_group VARCHAR(255) DEFAULT 'Primary',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_company_group UNIQUE (company_id, name)
      );
    `);

    // 🟩 3. DAY 8: Units of Measure (UOM) Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uoms (
        id SERIAL PRIMARY KEY,
        company_id INT NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        formal_name VARCHAR(50),
        CONSTRAINT unique_company_uom UNIQUE (company_id, symbol)
      );
    `);

    // 🟩 4. DAY 8: Stock Items Table
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
      // 🟩 DAY 9: Parent Voucher Header Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id SERIAL PRIMARY KEY,
        company_id INT NOT NULL,
        voucher_number VARCHAR(100) NOT NULL,
        voucher_type VARCHAR(50) NOT NULL, -- CONTRA, PAYMENT, RECEIPT, JOURNAL, PURCHASE, SALES
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        narration TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_company_voucher UNIQUE (company_id, voucher_type, voucher_number)
      );
    `);

    // 🟩 DAY 9: Child Voucher Entries Split Ledger Matrix Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS voucher_entries (
        id SERIAL PRIMARY KEY,
        voucher_id INT REFERENCES vouchers(id) ON DELETE CASCADE,
        ledger_id INT REFERENCES ledgers(id) ON DELETE RESTRICT,
        entry_type VARCHAR(2) NOT NULL, -- 'DR' (Debit) or 'CR' (Credit)
        amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0)
      );
    `);

    console.log("🚀 NeonDB verified: Day 9 Accounting Voucher tables are 100% compliant!");
      }  catch (err) {
    console.error("❌ Schema sync failed:", err); 
  }
};
syncDatabaseSchema();


// ROUTE 1: USER REGISTRATION
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully!", user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server registration error");
  }
});

// ROUTE 2: USER LOGIN (WITH JWT AUTHENTICATION)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: "Login successful!", token, username: user.username });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server login error");
  }
});

// Day 2 database test route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "Cloud Database connected successfully!", time: result.rows });
  } catch (err) {
    res.status(500).send("Database connection failed.");
  }
});

// ROUTE 3: PROTECTED USER PROFILE
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [req.user.id]);
    res.json({ 
      message: "Welcome to your protected SmartERP Dashboard!", 
      user: userResult.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server profile fetching error");
  }
});

// MODULE ROUTES (Day 4, 5, 6 ,7 and 8)
app.use('/api/companies', require('./routes/companies'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ledgers', require('./routes/ledgers'));
app.use('/api/items', require('./routes/items'));
app.use('/api/groups', require('./routes/groups'));
app.use('/', require('./routes/stockRoutes')); 
app.use('/', require('./routes/ledgerRoutes'));
// 🟩 DAY 9: MOUNT DOUBLE-ENTRY VOUCHER ROUTER
app.use('/', require('./routes/voucherRoutes'));
// 🟩 MOUNT DAY 9 CORE LEDGERS SEEDER ROUTE
app.use('/', require('./routes/seedRoutes'));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
