const express = require('express')
const mongoose = require('mongoose')
const Article = require('./models/article')
const articleRouter = require('./routes/articleRouter')
const methodOverride = require('method-override')

const userRouter = require('./routes/userRouter');
const passport = require('passport')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const User = require('./models/user');
const Util = require('./routes/util');
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

const app = express()
//'mongodb://localhost/blog'
mongoose.connect('mongodb://localhost/blog',{
    useNewUrlParser: true , useUnifiedTopology: true, useCreateIndex: true
})

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine','ejs')

app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.get('/', async (req,res)=>{
    try{
        const articles = await Article.find().sort({ noOfViews:'desc', createdAt: 'desc'})
        articles.forEach( (e) => {
            e.displayTime = Util.calculateTime(e.createdAt);
        });
        res.render('articles/showAll', { articles: articles })
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/articles',articleRouter);
app.use('/user',userRouter);
app.use(bodyParser.json( { extended : false} ) );
app.use(bodyParser.raw());
app.use(cookieParser());

app.listen(process.env.PORT || 3000);