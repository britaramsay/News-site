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
            // TODO: Fix all to matchc cheerio
            var title = element.children[1].children[0].children[0].children[0].data
            var photo = $(element).children().text().substring($(element).children().text().indexOf('https'), $(element).children().text().indexOf('" alt'))
           
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
                        
                        return res.json(added)
                    })
                    .catch(function(err) {
                        return res.json(err);
                    });
                }
            })
        })
    })
    console.log(added)
    // res.render('index', added)    
})

router.get('/', (req, res) => {
    db.Movie.find({})
    .populate('comment')
    .then(function (data) { 
        data.map((element) => {
            if(req.cookies.saved.indexOf(element._id+'') !== -1)
                element.save = true
            else    
                element.save = false
            element.numComments = element.comment.length
        })
        res.render('index', { noneSaved: false, headlines: data })    
    })    
})

router.get('/saved', (req, res) => {
    if(req.cookies.saved) {
        var results = []
        
        req.cookies.saved.forEach(getArray)
        function getArray(movie, index, array) {
            db.Movie.findOne({_id: movie})
            .populate('comment')            
            .then((data) => { 
                data.save = true
                data.numComments = data.comment.length
                results.push(data)
                if(index == array.length - 1){
                    res.render('index', { noneSaved: false, headlines: results })            
                }
                else return results
            })  
        }   
    }
    else {
        var data = []
        res.render('index', { noneSaved: true })    
    }
})

router.post('/remove/:id', (req, res) => {
    req.cookies.saved.splice(req.cookies.saved.indexOf(req.params.id), 1)

    var newCookie = req.cookies.saved
    res.clearCookie('saved');

    res.cookie('saved', newCookie, { maxAge: 9000000000 }); 
    res.json('Deleted')
        // deleted at most one tank document
})

router.post('/addComment/:id', (req, res) => {
    // create comment from form body
    db.Comment.create(req.body).then(function (comment) {  
        if(req.cookies.comment) {
            // If cookie is define, push new comment id
            var arr = req.cookies.comment
            arr.push(comment._id)
            res.clearCookie('comment');

            res.cookie('comment', arr, { maxAge: 9000000000 });   
        }        
        else {
            var arr = []
            arr.push(comment._id)
            // Set cookie
            res.cookie('comment', arr, { maxAge: 9000000000 });
        }   
        comment.movieID = req.params.id 

        return db.Movie.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: comment._id } }, { new: true })
        .then(function(dbMovie) {
        // If the User was updated successfully, send it back to the client
            // res.json(dbMovie);
            movie.comment.forEach(getArray)
            function getArray(element, index, array) {  
                db.Comment.findOne({_id: element}).then(function (comment) {
                    comments.push(comment)
                    if(index == array.length - 1)
                        res.render('partials/comments', {movieID: req.params.id, commentLength: comments.length, comments: comments, layout:false})    
                })
            }              
        })
        .catch(function(err) {
        // If an error occurs, send it back to the client
            res.json(err);
        });
    })
})

router.post('/save/:id', (req, res) => {
    if(req.cookies.saved) {
        // If cookie is define, push new comment id
        if(req.cookies.saved.indexOf(req.params.id) == -1) {
            var arr = req.cookies.saved
            arr.push(req.params.id)
            res.clearCookie('saved');
    
            res.cookie('saved', arr, { maxAge: 9000000000 });   
        }
    }        
    else {
        var arr = []
        arr.push(req.params.id)
        // Set cookie
        res.cookie('saved', arr, { maxAge: 9000000000 });
    } 
    return res.json('saved')
})

// Get all comments on the movie
router.get('/getComments/:id', (req, res) => {
    db.Movie.findOne({_id: req.params.id}).then(function (movie) {
        var comments = []
        movie.comment.forEach(getArray)
        function getArray(element, index, array) { 
            // db.Movie.update({_id: user._id}, {$unset: {field: 1 }})
            // console.log(element) 
            db.Comment.findOne({_id: element}).then(function (comment) {
                if(comment) {
                    comment.movieID = req.params.id 
                    if(req.cookies.comment) {
                        req.cookies.comment.forEach(com => {
                            if(com == comment._id) {
                                comment.owner = true
                            }
                            else if(!comment.owner)
                                comment.owner = false
                        })
                    }
                    else    
                        comment.owner = false
                    comments.push(comment)
                
                }
                if(index == array.length - 1)
                    res.render('partials/comments', {comments: comments, layout:false})    
            })
        }  
    })
    .catch(function (err) {  
        res.json(err)
    })
})

router.post('/deleteComment/:id', (req, res) => {
    
    db.Comment.remove({_id: req.params.id}, function (err) {
        if(!err) {
            req.cookies.comment.splice(req.cookies.comment.indexOf(req.params.id), 1)

            var newCookie = req.cookies.comment
            res.clearCookie('comment');

            res.cookie('comment', newCookie, { maxAge: 9000000000 }); 
        }
    console.log('hi')
        
        if (err) console.log(err);
        else res.json('Deleted')
        // deleted at most one tank document
    })
})

module.exports = router;