const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { Role, READ_PERMISSIONS, WRITE_PERMISSIONS, MANAGEMENT_PERMISSIONS } = require('../models/role.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Basic authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId, isActive: true }).populate('role');

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch {
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

// Role checking middleware
const checkRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const role = await Role.findOne({ name:requiredRole});
            
            if (!role) {
                return res.status(400).json({ message: 'Invalid role specified' });
            }

            // For anonymous role, allow access without checking user
            if (requiredRole === 'ANONYMOUS') {
                return next();
            }

            // For other roles, check if user exists and has the required role
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            if (req.user.role.name !== requiredRole) {
                return res.status(403).json({ 
                    message: 'You do not have the required role for this action' 
                });
            }
            
            next();
        } catch {
            return res.status(500).json({ message: 'Error checking role' });
        }
    };
};

// Read permission middleware
const checkReadPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const userPermissions = req.user.role.permissions;

            // Check if user has the specific read permission
            if (requiredPermission === READ_PERMISSIONS.ALL && userPermissions.includes(READ_PERMISSIONS.ALL)) {
                return next();
            }

            // Check if user has read:all permission
            if (requiredPermission === READ_PERMISSIONS.OWN && userPermissions.includes(READ_PERMISSIONS.OWN)) {
                return next();
            }

            // Check for read:own permission
            if (requiredPermission === READ_PERMISSIONS.PUBLIC && userPermissions.includes(READ_PERMISSIONS.PUBLIC)) {
                // Additional check if the resource belongs to the user
                // if (req.params.userId && req.params.userId === req.user._id.toString()) {
                    return next();
                // }
            }

            return res.status(403).json({ 
                message: 'You do not have permission to read this resource' 
            });
        } catch {
            return res.status(500).json({ message: 'Error checking read permission' });
        }
    };
};

// Write permission middleware
const checkWritePermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const userPermissions = req.user.role.permissions;

            // Check if user has the specific write permission
            if (userPermissions.includes(requiredPermission)) {
                return next();
            }

            // Check if user has write:all permission
            if (userPermissions.includes(WRITE_PERMISSIONS.ALL)) {
                return next();
            }

            // Check for write:own permission
            if (requiredPermission === WRITE_PERMISSIONS.OWN && userPermissions.includes(WRITE_PERMISSIONS.OWN)) {
                // Additional check if the resource belongs to the user
                if (req.params.userId && req.params.userId === req.user._id.toString()) {
                    return next();
                }
            }

            return res.status(403).json({ 
                message: 'You do not have permission to modify this resource' 
            });
        } catch {
            return res.status(500).json({ message: 'Error checking write permission' });
        }
    };
};

// Management permission middleware
const checkManagementPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const userPermissions = req.user.role.permissions;

            // Check if user has the specific management permission
            if (userPermissions.includes(requiredPermission)) {
                return next();
            }

            // Check if user has manage:all permission
            if (userPermissions.includes(MANAGEMENT_PERMISSIONS.ALL)) {
                return next();
            }

            // Check if user has manage:system permission (highest level)
            if (userPermissions.includes(MANAGEMENT_PERMISSIONS.SYSTEM)) {
                return next();
            }

            return res.status(403).json({ 
                message: 'You do not have permission to manage this resource' 
            });
        } catch {
            return res.status(500).json({ message: 'Error checking management permission' });
        }
    };
};

module.exports = {
    auth,
    checkRole,
    checkReadPermission,
    checkWritePermission,
    checkManagementPermission
};
