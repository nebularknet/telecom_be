const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
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
      enum: ['client', 'admin', 'tenant_admin', 'billing_manager'], // Expanded roles
      default: 'client',
      index: true, // Added index for role
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      index: true, // Index for faster lookup
      sparse: true, // Good for optional fields that are indexed
    },
    resetPasswordToken: {
      type: String,
      index: true, // Index for faster lookup
      sparse: true, // Good for optional fields that are indexed
    },
    resetPasswordExpires: {
      type: Date,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
      // required: function() { return this.role === 'client' || this.role === 'tenant_admin'; } // Example conditional requirement
      // For now, keeping it optional to avoid breaking existing logic until tenant assignment strategy is fully in place.
      default: null,
    },
    // created_at and updated_at will be handled by the timestamps option below
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
); // Automatically manage created_at and updated_at
module.exports = mongoose.model('user', UserSchema);
