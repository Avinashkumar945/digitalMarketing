export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Handle preflight request
        return res.status(200).end();
    }

    if (req.method === 'POST') {
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

            return res.status(200).json({
                success: true,
                message: 'Message received and saved!',
                data: contactData
            });

        } catch (error) {
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
