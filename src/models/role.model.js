const mongoose = require('mongoose');

// Define permission constants
const READ_PERMISSIONS = {
    PUBLIC: 'read:public',
    OWN: 'read:own',
    PREMIUM: 'read:premium',
    ENTERPRISE: 'read:enterprise',
    ALL: 'read:all',
    LOGS: 'read:logs',
    AUDIT: 'read:audit',
    REPORTS: 'read:reports',
    BILLING: 'read:billing'
};

const WRITE_PERMISSIONS = {
    OWN: 'write:own',
    PREMIUM: 'write:premium',
    ENTERPRISE: 'write:enterprise',
    ALL: 'write:all',
    USERS: 'write:users',
    CONTENT: 'write:content',
    BILLING: 'write:billing'
};

const MANAGEMENT_PERMISSIONS = {
    USERS: 'manage:users',
    BILLING: 'manage:billing',
    API_KEYS: 'manage:api_keys',
    CONFIG: 'manage:config',
    INVOICES: 'manage:invoices',
    REFUNDS: 'manage:refunds',
    CONTENT: 'manage:content',
    ALL: 'manage:all',
    SYSTEM: 'manage:system'
};

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: [
            // User Roles
            'ANONYMOUS',
            'FREE_USER',
            'TRIAL_USER',
            'PAID_USER',
            'ENTERPRISE_USER',
            
            // Organization/Team Roles
            'OWNER',
            'ADMIN',
            'DEVELOPER',
            'BILLING_MANAGER',
            'VIEWER',
            
            // System/Internal Roles
            'SUPER_ADMIN',
            'SUPPORT_AGENT',
            'MODERATOR',
            'AUDITOR'
        ]
    },
    category: {
        type: String,
        required: true,
        enum: ['USER', 'ORGANIZATION', 'SYSTEM']
    },
    description: {
        type: String,
        required: true
    },
    permissions: [{
        type: String,
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to update the updatedAt timestamp
roleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to initialize default roles
roleSchema.statics.initializeRoles = async function() {
    const defaultRoles = [
        // User Roles
        {
            name: 'ANONYMOUS',
            category: 'USER',
            description: 'Unauthenticated user with limited access',
            permissions: [READ_PERMISSIONS.PUBLIC]
        },
        {
            name: 'FREE_USER',
            category: 'USER',
            description: 'Registered but on a free plan',
            permissions: [READ_PERMISSIONS.PUBLIC, READ_PERMISSIONS.OWN, WRITE_PERMISSIONS.OWN]
        },
        {
            name: 'TRIAL_USER',
            category: 'USER',
            description: 'Time-bound trial access to premium features',
            permissions: [
                READ_PERMISSIONS.PUBLIC, 
                READ_PERMISSIONS.OWN, 
                WRITE_PERMISSIONS.OWN, 
                READ_PERMISSIONS.PREMIUM
            ]
        },
        {
            name: 'PAID_USER',
            category: 'USER',
            description: 'Subscribed to a plan with higher limits',
            permissions: [
                READ_PERMISSIONS.PUBLIC, 
                READ_PERMISSIONS.OWN, 
                WRITE_PERMISSIONS.OWN, 
                READ_PERMISSIONS.PREMIUM, 
                WRITE_PERMISSIONS.PREMIUM
            ]
        },
        {
            name: 'ENTERPRISE_USER',
            category: 'USER',
            description: 'Custom plan with SLAs and higher limits',
            permissions: [
                READ_PERMISSIONS.PUBLIC, 
                READ_PERMISSIONS.OWN, 
                WRITE_PERMISSIONS.OWN, 
                READ_PERMISSIONS.PREMIUM, 
                WRITE_PERMISSIONS.PREMIUM,
                READ_PERMISSIONS.ENTERPRISE,
                WRITE_PERMISSIONS.ENTERPRISE
            ]
        },

        // Organization/Team Roles
        {
            name: 'OWNER',
            category: 'ORGANIZATION',
            description: 'Full access to billing, user management, API keys',
            permissions: [
                READ_PERMISSIONS.ALL,
                WRITE_PERMISSIONS.ALL,
                MANAGEMENT_PERMISSIONS.USERS,
                MANAGEMENT_PERMISSIONS.BILLING,
                MANAGEMENT_PERMISSIONS.API_KEYS
            ]
        },
        {
            name: 'ADMIN',
            category: 'ORGANIZATION',
            description: 'Can manage team members and service configs',
            permissions: [
                READ_PERMISSIONS.ALL,
                WRITE_PERMISSIONS.ALL,
                MANAGEMENT_PERMISSIONS.USERS,
                MANAGEMENT_PERMISSIONS.CONFIG
            ]
        },
        {
            name: 'DEVELOPER',
            category: 'ORGANIZATION',
            description: 'Can create API keys and see logs',
            permissions: [
                READ_PERMISSIONS.OWN,
                WRITE_PERMISSIONS.OWN,
                MANAGEMENT_PERMISSIONS.API_KEYS,
                READ_PERMISSIONS.LOGS
            ]
        },
        {
            name: 'BILLING_MANAGER',
            category: 'ORGANIZATION',
            description: 'Manages invoices and plan upgrades',
            permissions: [
                READ_PERMISSIONS.BILLING,
                WRITE_PERMISSIONS.BILLING,
                MANAGEMENT_PERMISSIONS.INVOICES
            ]
        },
        {
            name: 'VIEWER',
            category: 'ORGANIZATION',
            description: 'Read-only access to dashboards',
            permissions: [
                READ_PERMISSIONS.OWN,
                READ_PERMISSIONS.REPORTS
            ]
        },

        // System/Internal Roles
        {
            name: 'SUPER_ADMIN',
            category: 'SYSTEM',
            description: 'Full backend access and system management',
            permissions: [
                READ_PERMISSIONS.ALL,
                WRITE_PERMISSIONS.ALL,
                MANAGEMENT_PERMISSIONS.ALL,
                MANAGEMENT_PERMISSIONS.SYSTEM
            ]
        },
        {
            name: 'SUPPORT_AGENT',
            category: 'SYSTEM',
            description: 'Can view user info and issue refunds',
            permissions: [
                READ_PERMISSIONS.ALL,
                WRITE_PERMISSIONS.USERS,
                MANAGEMENT_PERMISSIONS.REFUNDS
            ]
        },
        {
            name: 'MODERATOR',
            category: 'SYSTEM',
            description: 'Monitors content and violations',
            permissions: [
                READ_PERMISSIONS.ALL,
                WRITE_PERMISSIONS.CONTENT,
                MANAGEMENT_PERMISSIONS.CONTENT
            ]
        },
        {
            name: 'AUDITOR',
            category: 'SYSTEM',
            description: 'Read-only access for compliance',
            permissions: [
                READ_PERMISSIONS.ALL,
                READ_PERMISSIONS.LOGS,
                READ_PERMISSIONS.AUDIT
            ]
        }
    ];

    try {
        for (const role of defaultRoles) {
            await this.findOneAndUpdate(
                { name: role.name },
                role,
                { upsert: true, new: true }
            );
        }
        process.stderr.write('Default roles initialized successfully');
    } catch (error) {
        process.stderr.write('Error initializing default roles:', error);
        throw error;
    }
};

const Role = mongoose.model('Role', roleSchema);

module.exports = {
    Role,
    READ_PERMISSIONS,
    WRITE_PERMISSIONS,
    MANAGEMENT_PERMISSIONS
}; 