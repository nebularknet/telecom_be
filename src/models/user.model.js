const mongoose = require('mongoose');

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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
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
