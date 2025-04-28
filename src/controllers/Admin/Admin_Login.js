const UserSchemas = require('../../models/users_model');
const bcrypy = require('bcryptjs');
const jwt = require('jsonwebtoken');



// Admin Login
const AdminLogin = async (req, res) => {
    // Ensure req.body exists
    if (!req.body) {
        console.error('Admin login error: Request body is missing or empty.');
        return res.status(400).json({ message: 'Request body is missing or empty.' });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        console.warn('Admin login validation failed: Missing email or password.');
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Find user by email
        const user = await UserSchemas.findOne({ email });

        // Check if user exists and is an admin
        if (!user || user.role !== 'admin') {
             console.warn(`Admin login failed: User not found or not admin for email ${email}`);
             // Use 401 Unauthorized for authentication failures
             return res.status(401).json({ message: 'Invalid credentials or insufficient permissions.' });
        }

        // Compare passwords using the imported bcryptjs library (aliased as bcrypy)
        const isMatch = await bcrypy.compare(password, user.password);
        if (!isMatch) {
            console.warn(`Admin login failed: Incorrect password for email ${email}`);
            // Use 401 Unauthorized for authentication failures
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Check if JWT_SECRET is available
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET environment variable is not set. Cannot generate token.');
            // Internal server error because the server is misconfigured
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        // Generate JWT token
        const payload = {
            userId: user._id,
            role: user.role,
            email: user.email
            // Consider adding other non-sensitive claims if needed
        };
        const token = jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: '1h' } // Token expires in 1 hour - adjust as needed
        );

        // Send success response with token
        console.info(`Admin logged in successfully: ${user.email}`);
        res.status(200).json({
            message: 'Admin login successful.',
            token: token,
            user: { // Return only necessary, non-sensitive user info
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        // Generic server error for unexpected issues
        res.status(500).json({ message: 'Server error during admin login.' });
    }
};

module.exports = AdminLogin