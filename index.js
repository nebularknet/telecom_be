const app = require('./src/app.js');
const port = 3000;
const dotenv = require('dotenv');
const MongoDBConnect = require('./src/config/mongodb.js')
dotenv.config();
MongoDBConnect();
app.listen(port, () => {
    console.log('Server is running on port 3000');
});