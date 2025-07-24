// Required modules
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Correct DB connection using environment variable
const dbUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

// 🔧 TEMP: Init users table
app.get('/init-users', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
      );
    `);
    res.send('✅ Users table created or already exists.');
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    res.status(500).send('Error creating users table.');
  }
});

// 🔧 TEMP: Init contacts table
app.get('/init-contacts', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    res.send('✅ Contacts table created or already exists.');
  } catch (error) {
    console.error('❌ Error creating contacts table:', error);
    res.status(500).send('Error creating contacts table.');
  }
});

// 🔧 TEMP: Add test user
app.get('/add-test-user', async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO users (email, password)
      VALUES ('test@example.com', '123456')
      ON CONFLICT (email) DO NOTHING;
    `);
    res.send('✅ Test user added.');
  } catch (err) {
    console.error('❌ Error adding test user:', err);
    res.status(500).send('Error adding test user.');
  }
});

// 🧪 Debug DB route
app.get('/debug-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`✅ DB connected. Time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    res.status(500).send('❌ DB connection failed.');
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contacts (name, email, message, date) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [name.trim(), email.trim(), message.trim()]
    );
    res.status(200).json({
      success: true,
      message: '✅ Message saved to database!',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Email/password login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim()]);
    if (result.rows.length === 0 || result.rows[0].password !== password.trim()) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    res.status(200).json({ success: true, message: 'Login successful!' });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Google OAuth
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  console.log('✅ Google Profile:', profile);
  return done(null, profile);
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login-failed',
    successRedirect: '/login-success'
  })
);

app.get('/login-success', (req, res) => {
  res.send(`✅ Google Login successful! Welcome ${req.user?.displayName || 'user'}`);
});
app.get('/login-failed', (req, res) => {
  res.send('❌ Google Login failed.');
});

// Default and fallback routes
app.get('/', (req, res) => {
  res.send('🎉 Backend is live! POST /api/contact to save data to Postgres.');
});
app.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
