const { parsePhoneNumberFromString } = require('libphonenumber-js');
const mccMncList = require('mcc-mnc-list'); // Assuming you installed this package
const allMccMncData = mccMncList.all();
const cacheService = require('./cacheService'); // Import cache service
/**
 * Validates a phone number and attempts to find carrier information.
 * Generates an output object matching the veriphone.io structure.
 * @param {string} phoneNumber The phone number string to validate.
 * @returns {object} An object conforming to the desired output schema (veriphone.io like),
 * plus an internal MCCMNCData field for storage.
 */
async function validateAndGetCarrier(phoneNumber) {
  const cacheKey = `phonenumber:${phoneNumber}`;
  const cachedResult = cacheService.get(cacheKey);

  if (cachedResult) {
    // console.log(`Returning cached result for ${phoneNumber}`);
    return cachedResult;
  }

  // console.log(`No cache hit for ${phoneNumber}, performing full validation.`);
  // Initialize with nulls to match the veriphone.io structure for invalid numbers
  let validationResult = {
    Valid: false,
    Country: null,
    Carrier: null,
    Type: null,
    'Int. number': null,
    'Local number': null,
    'E164 number': null,
    Region: null,
    'Dial code': null,
    MCCMNCData: null, // This will be used for saving to DB, but excluded from API response
  };

  try {
    // Parse the phone number
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);

    // Check if the number is valid
    if (parsedNumber && parsedNumber.isValid()) {
      validationResult.Valid = true;
      // Map libphonenumber-js results to veriphone.io field names
      validationResult['E164 number'] = parsedNumber.format('E.164');
      validationResult['Int. number'] = parsedNumber.format('INTERNATIONAL');
      validationResult['Local number'] = parsedNumber.format('NATIONAL');
      const countryCode = parsedNumber.country; // Get country code for lookup
      validationResult.Country = countryCode
        ? getCountryName(countryCode)
        : null;
      validationResult['Dial code'] = parsedNumber.countryCallingCode;
      validationResult.Type = parsedNumber.getType();
      validationResult.Region = validationResult.Country; // Region often same as Country

      if (countryCode) {
        const potentialMccs = allMccMncData.filter(
          (item) => item.countryCode === countryCode,
        );

        if (potentialMccs.length > 0) {
          // Try to find an operator with a brand or operator name
          const foundOperator = potentialMccs.find(
            (item) => item.brand || item.operator,
          );

          if (foundOperator) {
            validationResult.Carrier =
              foundOperator.brand || foundOperator.operator;
            // Store the raw MCC/MNC data in the nested object for database
            validationResult.MCCMNCData = {
              mcc: foundOperator.mcc,
              mnc: foundOperator.mnc,
              brand: foundOperator.brand,
              operator: foundOperator.operator,
              type: foundOperator.type,
              status: foundOperator.status,
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
        validationResult.Country = countryCode
          ? getCountryName(countryCode)
          : null;
        validationResult['Dial code'] = parsedNumber.countryCallingCode;
        validationResult.Type = parsedNumber.getType(); // Might be 'UNKNOWN'
        validationResult.Region = validationResult.Country;
      }
    }
  } catch (error) {
    console.error('Error in validateAndGetCarrier service:', error);
    // Re-throw the error to be caught by the calling controller,
    // which will then pass it to the global error handler.
    // This allows for more centralized error management.
    // The service's responsibility is to perform its task or signal failure.
    throw error;
  }
  // This return is now only for the successful path within the try block.
  // If an error occurs, it's thrown before reaching here.
  // However, the current logic structure means validationResult is built up and returned
  // even if some parts fail (e.g. carrier lookup but number is valid).
  // The re-throw above is for truly unexpected errors in the try block.

  // Store in cache before returning
  cacheService.set(cacheKey, validationResult);
  return validationResult;
}

function getCountryName(countryCode) {
  const countryMap = {
    PK: 'Pakistan',
    US: 'United States',
    GB: 'United Kingdom',
  };
  return countryMap[countryCode] || countryCode; // Return code if name not found
}

module.exports = {
  validateAndGetCarrier,
};
