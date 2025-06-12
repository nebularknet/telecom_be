const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
      index: true,
    },
    subscriptionInfo: {
      planId: { type: String }, // e.g., 'basic_monthly', 'pro_annual'
      stripeSubscriptionId: { type: String }, // From payment gateway
      status: { type: String }, // e.g., 'active', 'past_due', 'canceled'
      // currentPeriodEndsAt: { type: Date }, // Could be useful
    },
    // Add other tenant-specific settings or information here
  },
  {
    timestamps: true,
  },
);

// Optional: Method to check if tenant is active
tenantSchema.methods.isActive = function () {
  return this.status === 'active';
};

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
