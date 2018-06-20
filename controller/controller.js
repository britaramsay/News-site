const   express = require('express'),
        router = express.Router(),
        request = require("request"),
        cheerio = require("cheerio"),
        db = require("../models");

router.get('/', function (req, res) {
    request('https://www.wsj.com/news/technology', function (err, response, html) {
        var $ = cheerio.load(html)

        $('.wsj-headline').each(function (index, element) {
            if(element.children[0].data == undefined) {
                let title = element.children[0].children[0].data,
                    link = element.children[0].children[0].parent.attribs.href

                db.Article.findOne({ title: title }).then(function (data) {
                    if(data == null) {
                        db.Article.create({ title: title, link: link})
                        .then(function(dbArticle) {
                            console.log(dbArticle);
                        })
                        .catch(function(err) {
                            // return res.json(err);
                        });
                    }
                    console.log(data)
                })
               
            }
            else {      
                let title = element.children[0].data,
                    link = element.children[0].parent.parent.parent.attribs.href
                db.Article.findOne({ title: title }).then(function (data) {
                    if(data == null) {
                        db.Article.create({ title: title, link: link})
                        .then(function(dbArticle) {
                            console.log(dbArticle);
                        })
                        .catch(function(err) {
                            // return res.json(err);
                        });
                    }
                })
            }
        });   
    })
    res.render('index')    
})

router.get('/headlines', (req, res) => {
    db.Article.find({}).then(function (data) {  
        res.render('partials/headlines', {headlines: data, layout:false})    
    })    
})

module.exports = router;