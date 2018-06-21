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
    db.Movie.find({})
    .populate('comment')
    .then(function (data) { 
        data.map((element) => {
            element.numComments = element.comment.length
        })
        res.render('partials/headlines', {headlines: data, layout:false})    
    })    
})

router.post('/addComment/:id', (req, res) => {
    console.log(req.body)
    db.Comment.create(req.body).then(function (comment) {  
    console.log('udhkj')
        
        return db.Movie.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: comment._id } }, { new: true })
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

router.get("/articles/:id", function(req, res) {
    db.Movie.findById(req.params.id) 
        .populate('comment')    
        .then(function (movie) {  
            res.json(movie)
        })   
        .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
    });
});

router.get('/getComments/:id', (req, res) => {
    db.Movie.findOne({_id: req.params.id}).then(function (movie) {
        var comments = []
        movie.comment.forEach(getArray)
        function getArray(element, index, array) {  
            db.Comment.findOne({_id: element}).then(function (comment) {
                comments.push(comment)
                if(index == array.length - 1)
                    res.render('partials/comments', {comments: comments, layout:false})    
            })
        }  
    })
    .catch(function (err) {  
        res.json(err)
    })
})

module.exports = router;