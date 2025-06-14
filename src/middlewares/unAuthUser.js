const rateLimit = require('express-rate-limit');

// Create rate limiter middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1, // limit each IP to 2 requests per windowMs
    message: 'You have reached your request limit. Please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'You have reached your request limit. Please try again later.'
        }).redirect('http://localhost:5173/signin');
    }
});

// Middleware to handle unauthenticated users
const UnAuthUser = async (req, res, next) => {
    try {
        // Apply rate limiting
        await limiter(req, res, (err) => {
            if (err) {
                return res.status(429).json({
                    success: false,
                    message: err.message,
                    redirectTo: 'http://localhost:5173/signin'  // Add redirect URL
                });
            }
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error while processing request'
        });
    }
};

module.exports = {
    UnAuthUser
};