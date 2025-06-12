const PhoneNumberValidation = require('../../models/phonenumberValidation');
const { validateAndGetCarrier } = require('../../service/libphonenumber');
const { BadRequestError } = require('../../utils/errors');

const veriphoneNumberSearch = async (req, res, next) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return next(new BadRequestError('Phone number is required.'));
  }

  try {
    // Perform validation and get carrier info
    const validationResult = await validateAndGetCarrier(phoneNumber);

    // Create a new document instance using the validation result.
    // Mongoose will save the data according to the schema, including MCCMNCData.
    const newValidation = new PhoneNumberValidation(validationResult);

    // Save the document to the database
    await newValidation.save();

    // Prepare the response object to match the veriphone.io format exactly.
    // Exclude the internal MCCMNCData field from the response.
    const apiResponse = {
      Valid: validationResult.Valid,
      Country: validationResult.Country,
      Carrier: validationResult.Carrier,
      Type: validationResult.Type,
      Int_number: validationResult['Int. number'],
      Local_number: validationResult['Local number'],
      E164_number: validationResult['E164 number'],
      Region: validationResult.Region,
      Dial_code: validationResult['Dial code'],
      MCCMNCData: validationResult.MCCMNCData,
    };

    // Send the validation result back in the desired format
    res.json(apiResponse);
  } catch (error) {
    console.error('Validation error:', error);
    // Pass error to the global error handler
    // If validateAndGetCarrier throws a custom AppError, it will be handled correctly.
    // Otherwise, it will be treated as an InternalServerError.
    next(error);
  }
};
module.exports = veriphoneNumberSearch;
