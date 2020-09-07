const jwt= require('jsonwebtoken');
const secretkey = "the secret key";

function authenticateUser(req, res, next) {
    try{    
        const authHeader = req.headers['cookie'];
        // 0 (split) 1
        //auth=asdgtreeF;
        //therefore [1] = the token
        const token = authHeader && authHeader.split('=')[1];
        if(token == null)
            return res.sendStatus(401);
        jwt.verify(token,secretkey,(err ,user) =>{
            console.log(err);
            if(err)
                return res.sendStatus(403);
            req.user = user;
            next();
        });
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
}

function calculateTime(localtime)
{
    //console.log("local time :"+localtime.getTime());
    //console.log("date time:"+Date.now());
    var res = 0;
    var retstr = "";
    var date = new Date(localtime);
    res = Date.now() - localtime.getTime();
    res = res / (1000 * 3600 * 24);
    //days
    if(res.toFixed(0) > 0)
        retstr = res.toFixed(0) + " days ago";
    //hours
    else if((res * 24).toFixed(0) > 0)
        retstr = (res * 24).toFixed(0) + " hours ago";
    //minutes
    else if((res * 60 * 24).toFixed(0) > 0)
        retstr = (res * 60 * 24).toFixed(0) + " minutes ago";
    //seconds
    else
        retstr = "a few minutes ago";
    //console.log("secs:"+(res * 3600 * 24).toFixed(0));
    return retstr;
}

function validatePassword(password){
    var passwordRegex = /^[A-Za-z]\w{7,14}$/;
    if(password.match(passwordRegex)){
        return true;
    }
    else{
        return false;
    }
}

module.exports = { secretkey , authenticateUser ,calculateTime ,validatePassword };