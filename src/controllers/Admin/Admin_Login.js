const UserSchemas = require('../../models/users_model');
const bcrypy = require('bcryptjs');
const jwt = require('jsonwebtoken');



// Admin Login
const AdminLogin = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Find user by email
        const user = await UserSchemas.findOne({ email });

        // Check if user exists and is an admin
        if (!user || user.role !== 'admin') {
             console.warn(`Admin login failed: User not found or not admin for email ${email}`);
             return res.status(401).json({ message: 'Invalid credentials or insufficient permissions.' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn(`Admin login failed: Incorrect password for email ${email}`);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Check if JWT_SECRET is available
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET environment variable is not set.');
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        // Generate JWT token
        const payload = {
            userId: user._id,
            role: user.role,
            email: user.email
        };
        const token = jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send success response with token
        console.info(`Admin logged in successfully: ${user.email}`);
        res.status(200).json({
            message: 'Admin login successful.',
            token: token,
            user: { // Optionally return non-sensitive user info
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during admin login.' });
    }
};

module.exports = AdminLogin