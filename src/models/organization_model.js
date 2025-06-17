const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    // Organization type/plan
    type: {
        type: String,
        enum: ['free', 'trial', 'paid', 'enterprise'],
        default: 'free'
    },
    // Organization status
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    // Organization settings
    settings: {
        maxUsers: {
            type: Number,
            default: 5
        },
        maxApiCalls: {
            type: Number,
            default: 1000
        },
        features: [{
            type: String
        }]
    },
    // Billing information
    billing: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'pro', 'enterprise'],
            default: 'free'
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'yearly'],
            default: 'monthly'
        },
        billingEmail: String,
        billingAddress: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        }
    },
    // Organization members
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'invited', 'suspended'],
            default: 'invited'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Organization owner
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    // API keys for the organization
    apiKeys: [{
        key: String,
        name: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        lastUsed: Date,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    // Usage tracking
    usage: {
        apiCalls: {
            type: Number,
            default: 0
        },
        lastApiCall: Date,
        monthlyLimit: {
            type: Number,
            default: 1000
        }
    }
}, {
    timestamps: true
});

// Indexes
OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ 'members.user': 1 });
OrganizationSchema.index({ owner: 1 });

// Virtual for checking if organization is active
OrganizationSchema.virtual('isActive').get(function() {
    return this.status === 'active';
});

// Method to check if a user is a member of the organization
OrganizationSchema.methods.hasMember = function(userId) {
    return this.members.some(member => 
        member.user.toString() === userId.toString() && 
        member.status === 'active'
    );
};

// Method to get a member's role
OrganizationSchema.methods.getMemberRole = function(userId) {
    const member = this.members.find(m => 
        m.user.toString() === userId.toString() && 
        m.status === 'active'
    );
    return member ? member.role : null;
};

// Method to add a member to the organization
OrganizationSchema.methods.addMember = async function(userId, roleId) {
    if (this.hasMember(userId)) {
        throw new Error('User is already a member of this organization');
    }
    
    this.members.push({
        user: userId,
        role: roleId,
        status: 'active',
        joinedAt: new Date()
    });
    
    return this.save();
};

// Method to remove a member from the organization
OrganizationSchema.methods.removeMember = async function(userId) {
    const memberIndex = this.members.findIndex(m => 
        m.user.toString() === userId.toString()
    );
    
    if (memberIndex === -1) {
        throw new Error('User is not a member of this organization');
    }
    
    this.members.splice(memberIndex, 1);
    return this.save();
};

// Method to update a member's role
OrganizationSchema.methods.updateMemberRole = async function(userId, newRoleId) {
    const member = this.members.find(m => 
        m.user.toString() === userId.toString()
    );
    
    if (!member) {
        throw new Error('User is not a member of this organization');
    }
    
    member.role = newRoleId;
    return this.save();
};

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = Organization;





