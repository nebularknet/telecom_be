const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['user', 'organization', 'system'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    permissions: [{
        resource: {
            type: String,
            required: true
        },
        actions: [{
            type: String,
            enum: ['create', 'read', 'update', 'delete', 'manage'],
            required: true
        }]
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Predefined roles
const PREDEFINED_ROLES = {
    // User Roles
    ANONYMOUS: {
        name: 'anonymous',
        type: 'user',
        description: 'Unauthenticated user with limited access',
        permissions: [
            { resource: 'api', actions: ['read'] },
            { resource: 'trial', actions: ['read'] }
        ]
    },
    FREE_USER: {
        name: 'free_user',
        type: 'user',
        description: 'Registered user on free plan',
        permissions: [
            { resource: 'api', actions: ['read'] },
            { resource: 'profile', actions: ['read', 'update'] }
        ]
    },
    TRIAL_USER: {
        name: 'trial_user',
        type: 'user',
        description: 'Time-bound trial access',
        permissions: [
            { resource: 'api', actions: ['read'] },
            { resource: 'premium_features', actions: ['read'] }
        ]
    },
    PAID_USER: {
        name: 'paid_user',
        type: 'user',
        description: 'Subscribed user with full access',
        permissions: [
            { resource: 'api', actions: ['read', 'create'] },
            { resource: 'premium_features', actions: ['read', 'create'] }
        ]
    },
    ENTERPRISE_USER: {
        name: 'enterprise_user',
        type: 'user',
        description: 'Enterprise user with custom plan',
        permissions: [
            { resource: '*', actions: ['read', 'create', 'update'] }
        ]
    },

    // Organization Roles
    OWNER: {
        name: 'owner',
        type: 'organization',
        description: 'Full access to organization',
        permissions: [
            { resource: '*', actions: ['create', 'read', 'update', 'delete', 'manage'] }
        ]
    },
    ADMIN: {
        name: 'admin',
        type: 'organization',
        description: 'Organization administrator',
        permissions: [
            { resource: 'team', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'settings', actions: ['read', 'update'] }
        ]
    },
    DEVELOPER: {
        name: 'developer',
        type: 'organization',
        description: 'Developer with API access',
        permissions: [
            { resource: 'api', actions: ['create', 'read', 'update'] },
            { resource: 'logs', actions: ['read'] }
        ]
    },
    BILLING_MANAGER: {
        name: 'billing_manager',
        type: 'organization',
        description: 'Manages billing and subscriptions',
        permissions: [
            { resource: 'billing', actions: ['read', 'update'] },
            { resource: 'invoices', actions: ['read', 'create'] }
        ]
    },
    VIEWER: {
        name: 'viewer',
        type: 'organization',
        description: 'Read-only access',
        permissions: [
            { resource: '*', actions: ['read'] }
        ]
    },

    // System Roles
    SUPER_ADMIN: {
        name: 'super_admin',
        type: 'system',
        description: 'Full system access',
        permissions: [
            { resource: '*', actions: ['create', 'read', 'update', 'delete', 'manage'] }
        ]
    },
    SUPPORT_AGENT: {
        name: 'support_agent',
        type: 'system',
        description: 'Support staff with limited admin access',
        permissions: [
            { resource: 'users', actions: ['read', 'update'] },
            { resource: 'tickets', actions: ['create', 'read', 'update'] }
        ]
    },
    MODERATOR: {
        name: 'moderator',
        type: 'system',
        description: 'Content moderator',
        permissions: [
            { resource: 'content', actions: ['read', 'update', 'delete'] },
            { resource: 'reports', actions: ['read', 'update'] }
        ]
    },
    AUDITOR: {
        name: 'auditor',
        type: 'system',
        description: 'System auditor',
        permissions: [
            { resource: '*', actions: ['read'] }
        ]
    }
};

// Static method to initialize predefined roles
RoleSchema.statics.initializeRoles = async function() {
    try {
        for (const role of Object.values(PREDEFINED_ROLES)) {
            await this.findOneAndUpdate(
                { name: role.name },
                role,
                { upsert: true, new: true }
            );
        }
        console.log('Predefined roles initialized successfully');
    } catch (error) {
        console.error('Error initializing roles:', error);
        throw error;
    }
};

const Role = mongoose.model('Role', RoleSchema);

module.exports = {
    Role,
    PREDEFINED_ROLES
};
