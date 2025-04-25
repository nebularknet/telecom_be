const mongoose = require('mongoose');

const verify = new mongoose.Schema({
    phone: {
      type: String,
      required: true,
      match: /^\+\d{1,3}-\d{6,14}$/, // Validates format like "+49-15123577723"
    },
    e164: {
      type: String,
      required: true,
      match: /^\+\d{10,15}$/, // Validates E.164 format like "+4915123577723"
    },
    phone_valid: {
      type: Boolean,
      required: true,
    },
    phone_type: {
      type: String,
      enum: ['mobile', 'landline', 'voip', 'unknown'],
      required: true,
    },
    phone_region: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    country_code: {
      type: String,
      required: true,
      match: /^[A-Z]{2}$/, // Validates ISO 3166-1 alpha-2 country codes
    },
    country_prefix: {
      type: String,
      required: true,
      match: /^\d+$/, // Validates numeric country prefix
    },
    international_number: {
      type: String,
      required: true,
    },
    local_number: {
      type: String,
      required: true,
    },
    carrier: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  });