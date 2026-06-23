const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const authMiddleware = require('./middleware/auth');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

    // FIXED: Extract the first user row object from the rows array
    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate the JWT token
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

app.use('/api/ledgers', require('./routes/ledgers'));
app.use('/api/items', require('./routes/items'));
app.use('/api/companies', require('./routes/companies'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
