const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Get token from Authorization header (typically "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

    if (token == null) {
        // No token provided
        console.warn('Auth Middleware: No token provided.');
        return res.status(401).json({ message: 'Access denied. No token provided.' }); // Unauthorized
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Token is invalid (e.g., expired, tampered, wrong secret)
            console.warn(`Auth Middleware: Token verification failed. Error: ${err.message}`);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Access denied. Token has expired.' });
            }
            return res.status(403).json({ message: 'Access denied. Invalid token.' }); // Forbidden
        }

        // Token is valid, attach the decoded payload to the request object
        // The payload typically contains user information like ID, role, etc.
        req.user = decoded; // e.g., req.user will have { userId: '...', role: '...', email: '...' }
        console.info(`Auth Middleware: Token verified successfully for user ${req.user.email || req.user.userId}`);
        next(); // Proceed to the next middleware or route handler
    });
};

// Optional: Middleware to check if the authenticated user is an admin
const isAdmin = (req, res, next) => {
    // This middleware should run *after* authenticateToken
    if (!req.user) {
        // This should ideally not happen if authenticateToken runs first and succeeds
        console.error('Authorization Middleware (isAdmin): req.user not found. Ensure authenticateToken runs first.');
        return res.status(500).json({ message: 'Authorization error: User information missing.' });
    }

    if (req.user.role !== 'admin') {
        console.warn(`Authorization Middleware (isAdmin): Access denied for user ${req.user.email || req.user.userId}. Role: ${req.user.role}. Admin required.`);
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' }); // Forbidden
    }

    // User has admin role, proceed
    console.info(`Authorization Middleware (isAdmin): Admin access granted for user ${req.user.email || req.user.userId}.`);
    next();
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const {role} = req.body;  // assuming the user is attached to the request (e.g., via JWT or session)
        
        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to access this resource.'
            });
        }

        next();  // If the role is allowed, proceed to the next middleware or route
    };
};
module.exports = {
    authenticateToken,
    isAdmin,
    checkRole
};
