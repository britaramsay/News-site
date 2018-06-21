const   express = require('express'),
        router = express.Router(),
        request = require("request"),
        cheerio = require("cheerio"),
        db = require("../models");

router.get('/', function (req, res) {
    request('https://movieweb.com/new-movies/', function (err, response, html) {
        var $ = cheerio.load(html)

        $('.movie').each((index, element) => {
            if(element.children[0].children[0])
                var photo = element.children[0].children[0].attribs.href
            var title = element.children[1].children[0].children[0].children[0].data
            var link = element.children[1].children[0].children[0].attribs.href
            if(element.children[1].children[0].next.children[1].children[0].attribs.class == 'movie-genre')
                var genre = element.children[1].children[0].next.children[1].children[0].children[0].data
            var synopsis = element.children[1].children[0].next.next.children[0].children[0].data
            db.Movie.findOne({ title: title }).then(function (data) {
                if(data == null) {
                    db.Movie.create({ title: title, link: link, genre: genre, synopsis: synopsis, photo: photo })
                    .then(function(dbMovie) {
                        console.log(dbMovie);
                    })
                    .catch(function(err) {
                        // return res.json(err);
                    });
                }
            })
        })
    })
    res.render('index')    
})

router.get('/headlines', (req, res) => {
    db.Movie.find({}).then(function (data) {  
        res.render('partials/headlines', {headlines: data, layout:false})    
    })    
})

router.post('/addComment/:id', (req, res) => {
    db.Comment.create({body: req.body}).then(function (comment) {  
    console.log('udhkj')
        
        return db.Movie.findOneAndUpdate({ _id: req.params.id }, { $set: { comment: comment._id } }, { new: true })
            .then(function(dbMovie) {
            // If the User was updated successfully, send it back to the client
            res.json(dbMovie);
            })
            .catch(function(err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
    })
})

module.exports = router;