const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_password',
  port: 5432,
});

// Test route
app.get('/videos', async (req, res) => {
  const result = await pool.query('SELECT * FROM videos');
  res.json(result.rows);
});

app.listen(4000, () => console.log('Server running on port 4000'));
