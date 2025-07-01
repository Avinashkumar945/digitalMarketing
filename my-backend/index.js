export default function handler(req, res) {
    if (req.method === 'POST') {
        try {
            console.log('Received request body:', req.body);

            const { name, email, message } = req.body;

            // Validation
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
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed.` });
    }
}
