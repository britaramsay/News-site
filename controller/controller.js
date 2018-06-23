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
                    if(element.children[1].children[0].next.children[1].children[0].attribs.class == 'movie-genre')
                        var genre = element.children[1].children[0].next.children[1].children[0].children[0].data
                    // Create movie
                    db.Movie.create({ 
                        title: title, 
                        link: element.children[1].children[0].children[0].attribs.href, 
                        genre: genre, 
                        synopsis: element.children[1].children[0].next.next.children[0].children[0].data, 
                        photo: photo 
                    })
                    .then(function(dbMovie) {
                        // Increment added
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
})

router.get('/', (req, res) => {
    // Find all db movies
    db.Movie.find({})
    .populate('comment')
    .then(function (data) { 
        // Map each movie
        if (data.length){
            data.map((element) => {
                // Set save = true if element is in cookie array
                if(req.cookies.saved){
                    if(req.cookies.saved.indexOf(element._id+'') !== -1)
                        element.save = true
                    else    
                        element.save = false
                }
                else    
                    element.save = false
                // Set numComments
                element.numComments = element.comment.length
            })
            // Render headlines
            res.render('index', { noneSaved: false, headlines: data })  
        }
        else        
            res.render('index', { noneSaved: false })          
    })    
})

router.get('/saved', (req, res) => {
    // If there are saved movies
    if(req.cookies.saved) {
        var results = []
        // Call get array for each movie saved in cookies
        req.cookies.saved.forEach(getArray)

        function getArray(movie, index, array) {
            // Find element db entry
            db.Movie.findOne({_id: movie})
            .populate('comment')            
            .then((data) => { 
                // Set save to true
                data.save = true
                // Set num comments
                data.numComments = data.comment.length
                // Push element to array
                results.push(data)
                
                return results
            })  
        }   
        res.render('index', { noneSaved: false, headlines: results })                    
    }
    // If there are not saved comments
    else {
        var data = []
        res.render('index', { noneSaved: true })    
    }
})

router.post('/remove/:id', (req, res) => {
    // Remove id from saved cookie
    req.cookies.saved.splice(req.cookies.saved.indexOf(req.params.id), 1)

    var newCookie = req.cookies.saved
    // Clear and resave cookie
    res.clearCookie('saved');
    res.cookie('saved', newCookie, { maxAge: 9000000000 }); 

    res.json('Deleted')
})

router.post('/addComment/:id', (req, res) => {
    // Create comment from form body
    db.Comment.create(req.body).then(function (comment) {  
        if(req.cookies.comment) {
            // If cookie is defined, push new comment id
            var arr = req.cookies.comment
            arr.push(comment._id)
            // Clear and resave cookie
            res.clearCookie('comment');
            res.cookie('comment', arr, { maxAge: 9000000000 });   
        }        
        else {
            var arr = []
            arr.push(comment._id)
            // Set cookie
            res.cookie('comment', arr, { maxAge: 9000000000 });
        }   
        // Set movieID
        comment.movieID = req.params.id 
        // Push new comment to db movie
        return db.Movie.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: comment._id } }, { new: true })
        .then(function(dbMovie) {
            // Call getArray for each comment
            movie.comment.forEach(getArray)
            function getArray(element, index, array) {  
                db.Comment.findOne({_id: element}).then(function (comment) {
                    // Push comment to array
                    comments.push(comment)
                    // Render comments on last array index
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
        // If cookie is defined, push new comment id
        if(req.cookies.saved.indexOf(req.params.id) == -1) {
            var arr = req.cookies.saved
            // Push new id to saved
            arr.push(req.params.id)
            // Clear and reset cookie
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

router.get('/getComments/:id', (req, res) => {
    // Find movie with given id
    db.Movie.findOne({_id: req.params.id}).then(function (movie) {
        var comments = []
        // Call getArray for each comment on movie
        movie.comment.forEach(getArray)

        function getArray(element, index, array) { 
            db.Comment.findOne({_id: element}).then(function (comment) {
                if(comment) {
                    // Set movieID
                    comment.movieID = req.params.id 
                    // If a comment was made by user
                    if(req.cookies.comment) {
                        // For each comment in cookies
                        req.cookies.comment.forEach(com => {
                            // Set owner to true or false
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
                // Render comments on last index
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
    // Remove comment with gien id
    db.Comment.remove({_id: req.params.id}, function (err) {
        if(!err) {
            // Remove id from cookies
            req.cookies.comment.splice(req.cookies.comment.indexOf(req.params.id), 1)

            var newCookie = req.cookies.comment
            // Clear and reset cookie
            res.clearCookie('comment');
            res.cookie('comment', newCookie, { maxAge: 9000000000 }); 
        }
        if (err) console.log(err);
        else res.json('Deleted')
    })
})

module.exports = router;