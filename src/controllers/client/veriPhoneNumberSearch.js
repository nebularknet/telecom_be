const PhoneNumberValidation = require("../../models/phonenumberValidation");
const { validateAndGetCarrier } = require("../../service/libphonenumber");

const veriphoneNumberSearch = async (req, res) => {
  const {role} = req.body;  // assuming the role is added to `req.user` after authentication

  // Ensure user has 'anonymous' role
  if (role !== 'anonymous') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permission to access this resource.'
    });
  }
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required." });
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
      "Valid": validationResult.Valid,
      "Country": validationResult.Country,
      "Carrier": validationResult.Carrier,
      "Type": validationResult.Type,
      "Int_number": validationResult["Int. number"],
      "Local_number": validationResult["Local number"],
      "E164_number": validationResult["E164 number"],
      "Region": validationResult.Region,
      "Dial_code": validationResult["Dial code"],
      "MCCMNCData": validationResult.MCCMNCData,
    };

    // Send the validation result back in the desired format
    res.json(apiResponse);
  } catch (error) {
    console.error("Validation error:", error);
    // Send a generic error response
    res.status(500).json({ error: "An error occurred during validation." });
  }
};
module.exports = veriphoneNumberSearch;
