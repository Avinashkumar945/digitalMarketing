const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL client

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Use different DB URLs for local and production
const isLocal = (process.env.NODE_ENV !== 'production');

const dbUrl = isLocal
  ? 'postgresql://digitalmarketing_db_user:591N2UNfVlVmspLvJH9suu5E8956dfFp@dpg-d1k494je5dus73e3ets0-a.singapore-postgres.render.com/digitalmarketing_db' // External DB URL for local dev
  : 'postgresql://digitalmarketing_db_user:591N2UNfVlVmspLvJH9suu5E8956dfFp@dpg-d1k494je5dus73e3ets0-a/digitalmarketing_db'; // Internal DB URL for Render

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

/*
// ✅ TEMP route to initialize the contacts table
// Commented out after use for security
app.get('/init-db', async (req, res) => {
  try {
    await pool.query(\`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    \`);
    res.send('✅ Table "contacts" created or already exists.');
  } catch (error) {
    console.error('❌ Error creating table:', error);
    res.status(500).send('❌ Error creating table.');
  }
});
*/

// Root route
app.get('/', (req, res) => {
  res.send('🎉 Backend is live! POST /api/contact to save data to Postgres.');
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contacts (name, email, message, date) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [name.trim(), email.trim(), message.trim()]
    );

    console.log('✅ Contact saved:', result.rows[0]);

    res.status(200).json({
      success: true,
      message: '✅ Message saved to database!',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Fallback route
app.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
