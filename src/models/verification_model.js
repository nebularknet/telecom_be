const mongoose = require('mongoose');

const VerificationPhoneSchema = new mongoose.Schema(
  {
    phone_number: {
      key: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
        index: true, // Added index
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['radio'],
        required: true,
      },
      options: {
        type: [String],
        required: true,
      },
    },
    country: {
      key: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['radio'],
        required: true,
      },
      options: {
        type: [String],
        required: true,
      },
    },
    carrier: {
      key: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['radio'],
        required: true,
      },
      options: {
        type: [String],
        required: true,
      },
    },
    type: {
      key: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['radio'],
        required: true,
      },
      options: {
        type: [String],
        required: true,
      },
    },
    region: {
      key: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['radio'],
        required: true,
      },
      options: {
        type: [String],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('veriphone', VerificationPhoneSchema);
