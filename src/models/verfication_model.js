const mongoose = require('mongoose');

const VerificationPhoneSchema = new mongoose.Schema({
    phone_number: {
        key: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['radio'],
            required: true
        },
        options: {
            type: [String],
            required: true
        }
    },
    country: {
        key: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['radio'],
            required: true
        },
        options: {
            type: [String],
            required: true
        }
    },
    carrier: {
      key: {
          type: String,
          required: true
      },
      value: {
          type: String,
          required: true
      },
      name: {
          type: String,
          required: true
      },
      type: {
          type: String,
          enum: ['radio'],
          required: true
      },
      options: {
          type: [String],
          required: true
      }
  },
  type: {
    key: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['radio'],
        required: true
    },
    options: {
        type: [String],
        required: true
    }
},
region: {
  key: {
      type: String,
      required: true
  },
  value: {
      type: String,
      required: true
  },
  name: {
      type: String,
      required: true
  },
  type: {
      type: String,
      enum: ['radio'],
      required: true
  },
  options: {
      type: [String],
      required: true
  }
},
status:{
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true
}
}, {
    timestamps: true
});

module.exports = mongoose.model('veriphone', VerificationPhoneSchema);