const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Replace with your actual frontend URL for production
const allowedOrigins = [
  'http://localhost:3000',
  'https://avinashkumar945.github.io',
  'https://avinashkumar945.github.io/digitalMarketing/'
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

// Handle preflight requests for all routes
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

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

    // TODO: Save contactData to a database or send an email

    return res.status(200).json({
      success: true,
      message: 'Message received and saved!',
      data: contactData
    });

  } catch (error) {
    console.error('Error in /api/contact endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Fallback for all other routes/methods
app.all('*', (req, res) => {
  res.status(405).json({ message: `Method ${req.method} not allowed.` });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
