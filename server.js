// Dependencies
const   express = require("express"),
        mongoose = require("mongoose"),
        request = require("request"),
        cheerio = require("cheerio"),
        exphbs = require("express-handlebars");        
        PORT = 3000,
        db = require("./models"),
        MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

var app = express();
app.use(express.static("public"));

app.engine('handlebars', exphbs({defaultLayout: 'main', extname: '.handlebars'}));
app.set('view engine', 'handlebars');

// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.get('/', function (req, res) {
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

app.get('/headlines', (req, res) => {
    db.Article.find({}).then(function (data) {  
        res.render('partials/headlines', {headlines: data, layout:false})    
    })    
})

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
