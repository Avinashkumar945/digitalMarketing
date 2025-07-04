const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('🎉 Backend is live! Use POST /api/contact to submit form data.');
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  try {
    console.log('Received request body:', req.body);

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const contactData = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      date: new Date().toISOString()
    };

    console.log('✅ Contact form data received:', contactData);

    // Simulate saving the data (or send email)
    return res.status(200).json({
      success: true,
      message: '✅ Message received successfully!',
      data: contactData
    });

  } catch (error) {
    console.error('❌ Error in /api/contact:', error);
    return res.status(500).json({
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
