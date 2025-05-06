const VeriPhoneSchema = require('../../../models/verfication_model'); // Assuming a model exists at this path

const getVeriPhoneData = async (req, res) => {
    try {
        // Fetch all veriPhoneData entries from the database
        // You might want to add pagination, filtering, or sorting here
        // depending on your specific requirements.
        const data = await VeriPhoneSchema.find({});

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'No VeriPhone data found.' });
        }

        // Send the fetched data as a JSON response
        res.status(200).json(data);

    } catch (error) {
        console.error('Error fetching VeriPhone data:', error);
        // Send an error response
        res.status(500).json({ message: 'Internal server error while fetching data.', error: error.message });
    }
};

module.exports = getVeriPhoneData;
