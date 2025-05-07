const { parsePhoneNumberFromString } = require('libphonenumber-js');
const mccMncList = require('mcc-mnc-list'); // Assuming you installed this package
const allMccMncData = mccMncList.all();
/**
 * Validates a phone number and attempts to find carrier information.
 * Generates an output object matching the veriphone.io structure.
 * @param {string} phoneNumber The phone number string to validate.
 * @returns {object} An object conforming to the desired output schema (veriphone.io like),
 * plus an internal MCCMNCData field for storage.
 */
async function validateAndGetCarrier(phoneNumber) {
  // Initialize with nulls to match the veriphone.io structure for invalid numbers
  let validationResult = {
    Valid: false,
    Country: null,
    Carrier: null,
    Type: null,
    "Int. number": null,
    "Local number": null,
    "E164 number": null,
    Region: null,
    "Dial code": null,
    MCCMNCData: null // This will be used for saving to DB, but excluded from API response
  };

  try {
    // Parse the phone number
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);

    // Check if the number is valid
    if (parsedNumber && parsedNumber.isValid()) {
      validationResult.Valid = true;
      // Map libphonenumber-js results to veriphone.io field names
      validationResult["E164 number"] = parsedNumber.format('E.164');
      validationResult["Int. number"] = parsedNumber.format('INTERNATIONAL');
      validationResult["Local number"] = parsedNumber.format('NATIONAL');
      const countryCode = parsedNumber.country; // Get country code for lookup
      validationResult.Country = countryCode ? getCountryName(countryCode) : null;
      validationResult["Dial code"] = parsedNumber.countryCallingCode;
      validationResult.Type = parsedNumber.getType();
      validationResult.Region = validationResult.Country; // Region often same as Country

      if (countryCode) {
         const potentialMccs = allMccMncData.filter(item => item.countryCode === countryCode);

         if (potentialMccs.length > 0) {
            // Try to find an operator with a brand or operator name
            const foundOperator = potentialMccs.find(item => item.brand || item.operator);

            if (foundOperator) {
                validationResult.Carrier = foundOperator.brand || foundOperator.operator;
                // Store the raw MCC/MNC data in the nested object for database
                validationResult.MCCMNCData = {
                    mcc: foundOperator.mcc,
                    mnc: foundOperator.mnc,
                    brand: foundOperator.brand,
                    operator: foundOperator.operator,
                    type: foundOperator.type,
                    status: foundOperator.status
                    // Add other fields from mcc-mnc-list.json here if needed
                };
            }
         }
      }

    } else {
      // Number is not valid, populate basic info if available from parsing
      validationResult.Valid = false;
      if (parsedNumber) {
         const countryCode = parsedNumber.country;
         validationResult.Country = countryCode ? getCountryName(countryCode) : null;
         validationResult["Dial code"] = parsedNumber.countryCallingCode;
         validationResult.Type = parsedNumber.getType(); // Might be 'UNKNOWN'
         validationResult.Region = validationResult.Country;
      }
    }

  } catch (error) {
    console.error('Error parsing or validating phone number:', error);
    // If parsing fails completely, the number is definitely not valid
    validationResult.Valid = false;
  }
  return validationResult;
}

function getCountryName(countryCode) {
    const countryMap = {
        "PK": "Pakistan",
        "US": "United States",
        "GB": "United Kingdom",
    };
    return countryMap[countryCode] || countryCode; // Return code if name not found
}


module.exports = {
  validateAndGetCarrier
};