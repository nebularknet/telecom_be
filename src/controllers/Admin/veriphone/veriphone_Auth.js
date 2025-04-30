const {OAuth2Client,OAuth2Client} = require('google-auth-library');


dotenv.config();

router.get('/', function(req, res, next){
   res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
   res.header('Referrer-Policy','no-referrer-when-downgrade');

   const redirectUrl='http://127.0.0.1:3000/oauth';
   const OAuth2Client=new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECURET_ID,
    redirectUrl
   );
   const authorizeUrl = OAuth2Client.generateAuthUrl({
     access_type:'offline',
     scope:'http://www.google.com/auth/userinfo.profile openId',
     prompt:'consent'
   });
 res.json({url:authorizeUrl});
})



// Oauth.js

async function getUserData(req, res, next){
const response = await fetch(`https://www.google.com/oauth2/v3/userinfo?access_token${accesstoken}`)
const data =  await response.json();
console.log('data', data);
}

router.get('/', async function(req, res,, next){
    const code =  req.query.code;
    try{
        const redirectUrl = 'https://127.0.0.1:3000/oauth';
        const OAuth2Client=new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECURET_ID,
            redirectUrl
           );
           const res= await OAuth2Client.getToken(code);
           await OAuth2Client.setCredentials(res.token);
           console.log('token acquired');
           const user = OAuth2Client.Credentials;
           console.log('credentials', user);
           await getUserData(user.access_token);
    }catch(err){
        console.log(err)
    }
})