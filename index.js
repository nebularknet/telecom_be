const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app.js'); 
const mongoDBConnect = require('./src/config/mongodb.js');

const port = process.env.PORT || 3000;

// Initialize MongoDB connection
mongoDBConnect();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
