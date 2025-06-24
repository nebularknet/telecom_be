const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const JWT_SECRET = process.env.JWT_SECRET;
const dotenv = require('dotenv')
dotenv.config();
const auth_ANONYMOUS = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.header('Authorization');
        let user = undefined;
        let token = undefined;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.replace('Bearer', '').trim();
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    user = await User.findOne({ _id: decoded.userId });
                } catch (err) {
                    // Invalid token, treat as anonymous
                    user = undefined;
                    token = undefined;
                }
            }
        }

        // Attach user and token to request (user may be undefined)
        req.user = user;
        req.token = token;

        // Always call next(), whether user is undefined (anonymous) or logged in
        return next();
    } catch (error) {
        // On unexpected error, treat as anonymous and continue
        req.user = undefined;
        req.token = undefined;
        return next();
    }
};
const auth = async (req, res, next) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or malformed.' });
      }
  
      const token = authHeader.replace('Bearer ', '').trim();
      if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
      }
  
      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
  
      // Find user and populate role
      const user = await User.findById(decoded.userId).populate('role');
      if (!user) {
        return res.status(401).json({ error: 'User not found or inactive.' });
      }
  
      // Attach user and token to request
      req.token = token;
      req.user = user;
      req.userRoleName = user.role?.name || 'UNKNOWN';
      req.userPermissions = user.role?.permissions || [];
  
      // Check if user has a valid role
      if (!user.role) {
        return res.status(403).json({ error: 'User role not assigned.' });
      }
  
      // Continue to next middleware/route
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed. Please try again.' });
    }
  };
// Optional authentication middleware for undefined users
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        // if (!token) {
        //     // If no token provided, set user as undefined and continue
        //     req.user = undefined;
        //     req.token = undefined;
        //     return next();
        // }a

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId, isActive: true }).populate('role');
        const defaultRole = await Role.findById({ _id:user.role }).populate('name');
        console.log(defaultRole)

        if (!user) {
            // If token is invalid or user not found, set user as undefined and continue
            req.user = undefined;
            req.token = undefined;
            return next();
        }
     
        if (user && user.role && !token) {
            // Set default role as FREE_USER for logged-in users without a role
            if (defaultRole.id === user.role) {
                // await User.findByIdAndUpdate(user._id, { role: defaultRole._id });
            }
                if (user.role.permissions && user.role.permissions.includes('read:public')) {
                    // User has permission, continue
                    req.token = token;
                    req.user = user;
                    return next();
                }
        }
        
        // If user exists and has a role, check permissions

        // req.token = token;
        // req.user = user;
        // next();
    } catch (error) {
        // If any error occurs during token verification, set user as undefined and continue
        req.user = undefined;
        req.token = undefined;
        next();
    }
};



module.exports = {
    auth,
    auth_ANONYMOUS,
    optionalAuth
};
