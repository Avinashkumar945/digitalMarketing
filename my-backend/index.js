const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

    // Define the path to contacts.json
    const filePath = path.join(__dirname, 'contacts.json');
    let contacts = [];

    // Read existing contacts if the file exists
    if (fs.existsSync(filePath)) {
      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        contacts = JSON.parse(fileData);
      } catch (parseError) {
        console.log('Error parsing existing contacts.json, starting fresh:', parseError);
        contacts = [];
      }
    }

    // Add the new contact
    contacts.push(contactData);

    // Write all contacts back to the file
    fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2), 'utf8');

    console.log('Contact form data saved successfully:', contactData);
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

// Listen on the port provided by Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app for Vercel
module.exports = app;
