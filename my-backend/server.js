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
    try {
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

        // Save locally if running on localhost
        if (process.env.NODE_ENV !== 'production') {
            const filePath = path.join(__dirname, 'contacts.json');

            let existingData = [];
            if (fs.existsSync(filePath)) {
                existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
            existingData.push(contactData);

            fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
            console.log('📂 Contact saved to contacts.json');
        } else {
            console.log('📋 Production mode: Data not saved to file (ephemeral filesystem).');
            // Here you could send it to a database instead
        }

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

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
