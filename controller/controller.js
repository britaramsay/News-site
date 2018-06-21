const   express = require('express'),
        router = express.Router(),
        request = require("request"),
        cheerio = require("cheerio"),
        db = require("../models");

router.get('/headlines', function (req, res) {
    var added = 0;
    request('https://movieweb.com/new-movies/', function (err, response, html) {
        var $ = cheerio.load(html)

        $('.movie').each((index, element) => {
            var title = element.children[1].children[0].children[0].children[0].data
            var photo = $(element).children().text().substring($(element).children().text().indexOf('https'), $(element).children().text().indexOf('" alt'))
            console.log('\n')
           
            // Look for this movie in the database
            db.Movie.findOne({ title: title }).then(function (data) {

                // Create new movie if it is not found
                if(data == null) {
                    // Save photo and genre if movie has one                    
                    // if(element.children[0].children[0])
                    if(element.children[1].children[0].next.children[1].children[0].attribs.class == 'movie-genre')
                        var genre = element.children[1].children[0].next.children[1].children[0].children[0].data
        
                    db.Movie.create({ 
                        title: title, 
                        link: element.children[1].children[0].children[0].attribs.href, 
                        genre: genre, 
                        synopsis: element.children[1].children[0].next.next.children[0].children[0].data, 
                        photo: photo 
                    })
                    .then(function(dbMovie) {
                        added++
                        console.log(added)
                        
                        return res.json(added)
                    })
                    .catch(function(err) {
                        return res.json(err);
                    });
                }
            })
        })
    })
    // res.render('index', added)    
})

router.get('/', (req, res) => {
    db.Movie.find({})
    .populate('comment')
    .then(function (data) { 
        data.map((element) => {
            element.numComments = element.comment.length
        })
        res.render('index', { headlines: data })    
    })    
})

router.post('/addComment/:id', (req, res) => {

    db.Comment.create(req.body).then(function (comment) {  
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

// Get all comments on the movie
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