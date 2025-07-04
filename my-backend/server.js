const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production';

// POST contact
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const newContact = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    date: new Date().toISOString()
  };

  if (!isProduction) {
    // Save to contacts.json locally
    const contactsFile = path.join(__dirname, 'contacts.json');
    let contacts = [];

    if (fs.existsSync(contactsFile)) {
      contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
    }
    contacts.push(newContact);

    fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));
    console.log('📄 Contact saved locally to contacts.json');
  } else {
    // In production, just log (or connect DB here)
    console.log('🌐 New contact (production):', newContact);
  }

  return res.status(200).json({
    success: true,
    message: '✅ Message received successfully!',
    data: newContact
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
