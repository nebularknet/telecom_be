const app = require('./src/app.js'); 
const port = 3000;
const dotenv = require('dotenv');
const mongoDBConnect = require('./src/config/mongodb.js');

dotenv.config();

mongoDBConnect();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});