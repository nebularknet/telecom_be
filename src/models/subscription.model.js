const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'cancelled'],
        default: 'active'
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'pending', 'failed'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
subscriptionSchema.index({ clientId: 1 });
subscriptionSchema.index({ planId: 1 });
subscriptionSchema.index({ status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;