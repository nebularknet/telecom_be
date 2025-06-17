Nconst { Role } = require('../models/role_model');

// Middleware to check if user has required role
const hasRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            // Convert single role to array
            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

            // Check if user has any of the required roles
            const userRoles = await Role.find({ _id: { $in: req.user.roles } });
            const hasRequiredRole = userRoles.some(role => roles.includes(role.name));

            if (!hasRequiredRole) {
                return res.status(403).json({ 
                    message: 'Access denied. Insufficient permissions.',
                    required: roles,
                    current: userRoles.map(r => r.name)
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({ message: 'Error checking user role' });
        }
    };
};

// Middleware to check if user has required permission
const hasPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const hasPermission = await req.user.hasPermission(resource, action);

            if (!hasPermission) {
                return res.status(403).json({ 
                    message: 'Access denied. Insufficient permissions.',
                    required: { resource, action }
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ message: 'Error checking user permission' });
        }
    };
};

// Middleware to check organization membership and role
const hasOrgRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const orgId = req.params.orgId || req.body.orgId;
            if (!orgId) {
                return res.status(400).json({ message: 'Organization ID is required' });
            }

            // Find user's organization membership
            const orgMembership = req.user.organizations.find(
                org => org.organization.toString() === orgId.toString()
            );

            if (!orgMembership) {
                return res.status(403).json({ message: 'Not a member of this organization' });
            }

            // Convert single role to array
            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

            // Check if user has any of the required roles in the organization
            const userRole = await Role.findById(orgMembership.role);
            const hasRequiredRole = roles.includes(userRole.name);

            if (!hasRequiredRole) {
                return res.status(403).json({ 
                    message: 'Access denied. Insufficient organization permissions.',
                    required: roles,
                    current: userRole.name
                });
            }

            // Add organization context to request
            req.organization = orgMembership;
            next();
        } catch (error) {
            console.error('Organization role check error:', error);
            res.status(500).json({ message: 'Error checking organization role' });
        }
    };
};

// Middleware to check organization permission
const hasOrgPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.organization) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const orgRole = await Role.findById(req.organization.role);
            const hasPermission = orgRole.permissions.some(
                permission => 
                    (permission.resource === '*' || permission.resource === resource) &&
                    permission.actions.includes(action)
            );

            if (!hasPermission) {
                return res.status(403).json({ 
                    message: 'Access denied. Insufficient organization permissions.',
                    required: { resource, action }
                });
            }

            next();
        } catch (error) {
            console.error('Organization permission check error:', error);
            res.status(500).json({ message: 'Error checking organization permission' });
        }
    };
};

module.exports = {
    hasRole,
    hasPermission,
    hasOrgRole,
    hasOrgPermission
};





