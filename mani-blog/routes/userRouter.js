const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('./../models/user');
const jwt= require('jsonwebtoken');
const Util = require('./util');
const Article = require('./../models/article');
const { check, validationResult } = require('express-validator');

router.post('/register', [
        check('email','email is required'),
        check('username','username is required').not().isEmpty(),
        check('password','password is required').not().isEmpty(),
        check('password').custom( ( value, { req } ) =>{
            if(Util.validatePassword(req.body.password))
                return true;
            else 
                return false;
        }).withMessage('password must be 7-14 characters, must contain only alpabets,digits,underscore and can only begin with an alphabet')
    ],
    async (req, res) => {
    try{
        const result = validationResult(req);
        var errors = result.errors;
        for(var key in errors){
            console.log(errors[key].value);
        }
        if(!result.isEmpty()){
            res.render('users/register',{errors:errors});
            return;
        }

        Users=new User({email: req.body.email, username : req.body.username}); 
    
        User.register(Users, req.body.password, function(err, user) { 
            if (err) 
            {
                res.json({success:false, message:"Your account could not be saved. Error: ", err})  
            }
            else
            { 
                res.render('users/login');
            } 
        });
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
}); 

router.get('/loginpage',async (req,res)=>{
    try{
        res.render('users/login',{errors:null});
    }
    catch(err){
        console.log(err);
        res.send(500);
    }
});

router.get('/registerpage',async (req,res)=>{
    try{
        res.render('users/register',{errors:null});
    }
    catch(err){
        console.log(err);
        res.send(500);
    }
});

router.post( '/login',[
        check('username','username is required').not().isEmpty(),
        check('password','password is required').not().isEmpty(),
    ], async (req, res) => {
    try{
        const result = validationResult(req);
        var errors = result.errors;
        for(var key in errors){
            console.log(errors[key].value);
        }
        if(!result.isEmpty()){
            res.render('users/login',{errors:errors});
            return;
        }
        await validateUserWithPassport(req,res);

    }
    catch(err){
        console.log(err);
        res.status(500);
    }
}); 

router.get("/logout", Util.authenticateUser , async (req,res)=>{
    try{
        res.clearCookie("auth");
        res.redirect("/");
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
});

//"username or password incorrect"
async function validateUserWithPassport(req,res)
{
    try{
        const articles = await Article.find({author:req.body.username}).sort({ createdAt: 'desc'})
        passport.authenticate('local', function (err, user, info) {  
                if(err){ 
                    //res.json({success: false, message: err, information : info}) 
                    console.log(err);
                    res.render("users/login",{ 
                        errors: [
                            {
                                msg : "username or password incorrect" 
                            }
                        ] 
                    });
                    return false;
                }
                else
                { 
                    if (! user) {
                        res.render("users/login",{ 
                            errors: [
                                {
                                    msg : "username or password incorrect" 
                                }
                            ] 
                        });
                        return false;
                    } 
                    else
                    { 
                        req.login(user, function(err){ 
                            if(err){ 
                                //res.json({success: false, message: err , information : info}) 
                                console.log(err);
                                res.render("users/login",{ 
                                    errors: [
                                        {
                                            msg : "username or password incorrect" 
                                        }
                                    ] 
                                });
                                return false;
                            }
                            else
                            { 
                                const token =  jwt.sign(
                                    {
                                        userId : user._id,  
                                        username:user.username
                                    }, Util.secretkey,  
                                    {
                                        expiresIn: '24h'
                                    }
                                );
                                res.clearCookie('auth');
                                res.cookie('auth',token);
                                res.render('articles/index', { articles: articles });
                                return true;
                            }
                        });
                    } 
                } 
        })(req, res);
    }
    catch(err){
        console.log(err);
        res.send(500);
    }
}

module.exports = router;