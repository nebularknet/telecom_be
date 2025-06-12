const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    price: {
      type: Number, // Store price in cents or smallest currency unit to avoid floating point issues
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'usd', // Or your default currency
    },
    features: [String], // List of features included in this plan
    stripePlanId: {
      // Or any payment gateway's plan ID
      type: String,
      // required: true, // May not be required if you have free plans or manual setup
      // unique: true, // If you map one-to-one with Stripe plans
    },
    billingCycle: {
      type: String,
      enum: ['month', 'year', 'one-time'],
      default: 'month',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    // Add other plan-specific details, e.g., trial period, limits
  },
  {
    timestamps: true,
  },
);

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
