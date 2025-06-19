const mongoose = require('mongoose');

const mccMncDataSchema = new mongoose.Schema({
  mcc: {
    type: String,
    description: "Mobile Country Code."
    // required: true // Removed required as MCCMNCData might be null
  },
  mnc: {
    type: String,
    description: "Mobile Network Code."
    // required: true // Removed required as MCCMNCData might be null
  },
  brand: {
    type: String,
    description: "Brand name from the MCC-MNC list.",
    default: null
  },
  operator: {
    type: String,
    description: "Operator name from the MCC-MNC list.",
    default: null
  },
  type: {
    type: String,
    description: "Type from the MCC-MNC list (e.g., National, Test).",
    default: null
  },
  status: {
    type: String,
    description: "Status from the MCC-MNC list (e.g., Operational).",
    default: null
  }
  // Add other relevant fields from mcc-mnc-list.json as needed
}, { _id: false }); // _id: false prevents Mongoose from creating a default _id for this subdocument

const phoneNumberValidationSchema = new mongoose.Schema({
  Valid: {
    type: Boolean,
    description: "Indicates if the phone number is valid.",
    required: true
  },
  Country: { // Matches veriphone.io
    type: String,
    description: "The full name of the country (e.g., Pakistan).",
    default: null
  },
  Carrier: { // Matches veriphone.io
    type: String,
    description: "The carrier or brand name obtained from MCC-MNC data (e.g., Zong).",
    default: null
  },
  Type: { // Matches veriphone.io
    type: String,
    description: "The type of the phone number (e.g., mobile, fixed-line).",
    default: null
  },
  "Int. number": { // Matches veriphone.io
    type: String,
    description: "The phone number in international format (e.g., +92 316 5290267).",
    default: null
  },
  "Local number": { // Matches veriphone.io
    type: String,
    description: "The phone number in national format (e.g., 0316 5290267).",
    default: null
  },
  "E164 number": { // Matches veriphone.io
    type: String,
    description: "The phone number in E.164 format (e.g., +923165290267).",
    default: null
  },
  Region: { // Matches veriphone.io
    type: String,
    description: "The region associated with the phone number (often the same as Country).",
    default: null
  },
  "Dial code": { // Matches veriphone.io
    type: String,
    description: "The country calling code (e.g., 92).",
    default: null
  },
  // Keeping the MCCMNCData for internal storage/future use, not in veriphone.io output
  MCCMNCData: {
    type: mccMncDataSchema,
    description: "Details from the MCC-MNC list, if available.",
    default: null
  }
  // Add any new data fields here in the future
}, { timestamps: true }); // Added timestamps for created and updated times

const PhoneNumberValidation = mongoose.model('PhoneNumberValidation', phoneNumberValidationSchema);

module.exports = PhoneNumberValidation;
