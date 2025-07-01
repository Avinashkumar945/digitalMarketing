const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Fixed CORS configuration - removed credentials
app.use(cors({
  origin: [
    'http://localhost:5500', 
    'http://127.0.0.1:5500', 
    'http://localhost:3000',
    'https://avinashkumar945.github.io'
  ]
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

module.exports = app;
