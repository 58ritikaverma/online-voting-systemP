const jwt = require("jsonwebtoken");

const JWT_SECERT = "ONLINE_VOTING_SYSTEM_SECRET_KEY";

const fetchUser = (req,res,next)=>{
    // Get the user from the jwt token an and add id to req object 
    const token = req.header('auth-token');
    if(!token){
        console.log(token)
        res.status(401).send({error: 'Please authenticate using a valid token'});
    }
    
    try {
        const data = jwt.verify(token,JWT_SECERT);
        req.user = data.user;
        next(); 
    } catch (error) {
        res.status(401).send({error: 'Please authenticate using a valid token'});
    }
}

module.exports = fetchUser;