const express = require('express');
const Article = require('./../models/article');
const articleRouter = express.Router();
const Util = require('./util');

articleRouter.get('/new',Util.authenticateUser,(req,res)=>{
    try{
        res.render('articles/new',{ article : new Article() });
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
});

articleRouter.get('/edit/:id', Util.authenticateUser , async (req,res)=>{
    try{
        const article = await Article.findById(req.params.id);
        res.render('articles/edit',{ article : article });
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
});

articleRouter.get('/:slug',Util.authenticateUser, async (req,res) => {
    try{
        const article = await Article.findOne( { slug : req.params.slug } );
        if (article == null || article === null) 
        {
            const articles = await Article.find({author : req.user.username}).sort({ createdAt: 'desc'});
            res.render('articles/index', { articles: articles });
            return;
        }
        res.render('articles/show',{ article: article });

    }
    catch(err){
        console.log(err);
        res.status(500);
    }
});

articleRouter.get('/showForUnauth/:id', async(req,res)=>{
    try{
        const article = await Article.findById({_id:req.params.id});
        article.noOfViews += 1;
        await article.save();
        res.render("articles/showForUnauth",{article:article});
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
});

articleRouter.get('/nindex',async (req,res,next) => {
    try{
        const articles = await Article.find({ author : req.user.username}).sort({ noOfViews:'desc',createdAt: 'desc'});
        //articles.forEach( (e) => {
        //    e.displayTime = Util.calculateTime();
        //});
        res.render('articles/index', { articles: articles });
        next();
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
});

articleRouter.post('/index', Util.authenticateUser, async (req,res,next) =>{
    try{
        req.article = new Article();
        next();
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
}, saveArticleAndRenderNext('new'));

articleRouter.post('/:id',Util.authenticateUser,async (req, res, next) => {
    try{
        req.article = await Article.findById(req.params.id);
        next();
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
}, saveArticleAndRenderNext('edit'));

articleRouter.delete('/:id', Util.authenticateUser ,async (req,res) => {
    try{
        await Article.findByIdAndDelete(req.params.id);
        const articles = await Article.find({author:req.body.username}).sort({ createdAt: 'desc'});
        res.render('articles/index', { articles: articles });
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
});

function saveArticleAndRenderNext(path){
    return async (req,res) => {
        let article = req.article;
        article.title =  req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;

        //trying to add the author
        article.author = req.user.username;

        try{
            article = await article.save();
            res.render("articles/show",{article:article});
        } catch (e) {
            res.render(`articles/${path}`,{article : article});
        }
    }
}

module.exports = articleRouter