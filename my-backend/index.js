const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
  credentials: true
}));

app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required.' 
      });
    }

    // Prepare the contact data object
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      date: new Date().toISOString()
    };

    // Note: File operations don't persist in serverless environments
    // For now, just log the data and return success
    console.log('Contact form data received:', contactData);
    
    res.json({ 
      success: true, 
      message: 'Message received and saved!',
      data: contactData
    });

  } catch (error) {
    console.error('Error in /api/contact endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
});

// DO NOT use app.listen() in Vercel serverless functions!
// Export the app for Vercel
module.exports = app;
