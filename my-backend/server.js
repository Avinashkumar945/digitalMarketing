const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Contact form endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
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

    // Save to contacts.json if running locally
    if (process.env.NODE_ENV !== 'production') {
        const filePath = path.join(__dirname, 'contacts.json');

        let existingContacts = [];
        if (fs.existsSync(filePath)) {
            try {
                const fileContents = fs.readFileSync(filePath, 'utf8');
                existingContacts = JSON.parse(fileContents);
            } catch (err) {
                console.error('⚠️ Could not read contacts.json:', err);
            }
        }

        existingContacts.push(contactData);

        try {
            fs.writeFileSync(filePath, JSON.stringify(existingContacts, null, 2), 'utf8');
            console.log('📂 Contact saved to contacts.json');
        } catch (err) {
            console.error('❌ Failed to save to contacts.json:', err);
        }
    } else {
        console.log('📋 Production mode: Skipping contacts.json save.');
    }

    return res.status(200).json({
        success: true,
        message: '✅ Message received successfully!',
        data: contactData
    });
});

// Fallback route
app.all('*', (req, res) => {
    res.status(404).json({ message: 'Route not found.' });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
