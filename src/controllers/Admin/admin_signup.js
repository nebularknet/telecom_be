const UserSchemas = require('../../models/users_model');
const bcryptjs = require('bcryptjs');

// Admin Register
const AdminRegister = async (req, res) => {
    // Check if req.body exists before attempting to destructure
    // NOTE: Ensure express.json() middleware is applied *before* this route in your app setup.
    if (!req.body) {
        console.error('Admin registration error: Request body is missing or empty.');
        // Send a 400 Bad Request response indicating the issue
        return res.status(400).json({ message: 'Request body is missing or empty.' });
    }

    const { fullname,email, password } = req.body;

    // Basic validation - Ensure required fields are provided
    if (!fullname||!email || !password) {
        // Log the received body for debugging partial data issues
        console.warn('Admin registration validation failed: Missing fields.', { fullname:!!fullname,email: !!email, password: !!password });
        return res.status(400).json({ message: 'Please provide fullname, email, and password.' });
    }

    try {
        // Check if an admin with the same email already exists
        const existingUser = await UserSchemas.findOne({ email });
        if (existingUser) {
            // If user exists, return a conflict error
            console.warn(`Admin registration conflict: Email ${email} already exists.`);
            return res.status(409).json({ message: 'Admin with this email already exists.' });
        }

        // Generate salt and hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create a new user instance with hashed password and admin role
        const newUser = new UserSchemas({
            fullname,
            email,
            password: hashedPassword,
            role: 'admin', // Explicitly setting role
        });

        // Save the new user to the database
        await newUser.save();

        // Respond with success message and the new user's ID (excluding sensitive info)
        console.info(`Admin registered successfully: ${newUser.email} (ID: ${newUser._id})`);
        res.status(201).json({ message: 'Admin registered successfully.', userId: newUser._id });

    } catch (error) {
        console.error('Admin registration error:', error);
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            // Extract validation error messages
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
        // Handle potential duplicate key errors from MongoDB (though covered by findOne check)
        if (error.code === 11000) {
             console.warn(`Admin registration duplicate key error: ${error.message}`);
             return res.status(409).json({ message: 'Admin with this email already exists (database constraint).' });
        }
        // Handle generic server errors
        res.status(500).json({ message: 'Server error during admin registration.' });
    }
};
module.exports=AdminRegister
