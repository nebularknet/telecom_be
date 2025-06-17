const mongoose = require('mongoose');
const { Role } = require('../models/role_model');

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address.'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'], // Example minimum length
        select: false, // Exclude password from default query results
    },
    role: {
        type: String,
        enum: ['anonymous', 'free_user', 'trial_user', 'paid_user', 'enterprise_user'], // Updated roles
        default: 'anonymous', // Default role
    },
},
    {
        timestamps:
        {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }); // Automatically manage created_at and updated_at
module.exports = mongoose.model("user", UserSchema);

const createOrganization = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Create organization
        const organization = new Organization({
            name,
            description,
            owner: req.user._id,
            slug: name.toLowerCase().replace(/\s+/g, '-')
        });

        // Add owner as first member with owner role
        const ownerRole = await Role.findOne({ name: 'owner' });
        organization.members.push({
            user: req.user._id,
            role: ownerRole._id,
            status: 'active'
        });

        await organization.save();

        // Update user's organizations array
        req.user.organizations.push({
            organization: organization._id,
            role: ownerRole._id,
            isDefault: true
        });
        await req.user.save();

        res.status(201).json({ organization });
    } catch (error) {
        res.status(500).json({ message: 'Error creating organization' });
    }
};
