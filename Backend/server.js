const express = require('express');
const { Pool } = require('pg');
require('dotenv').config(); // Loads .env variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Secure connection using the Neon connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test Database Connection Route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "Cloud Database connected successfully!", time: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Cloud Database connection failed.");
  }
});

app.get('/', (req, res) => {
  res.send('SmartERP Cloud Backend Server is Running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
