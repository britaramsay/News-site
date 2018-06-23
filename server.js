// Dependencies
const   express = require("express"),
        mongoose = require("mongoose"),
        exphbs = require("express-handlebars"),
        bodyParser = require("body-parser"),
        cookieParser = require('cookie-parser'),  
        port = process.env.PORT || 3000,
        MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines",
        routes = require("./controller/controller.js"),
        app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser())

app.engine('handlebars', exphbs({defaultLayout: 'main', extname: '.handlebars'}));
app.set('view engine', 'handlebars');

app.use(routes);

const cors = require('cors');

app.use(cors());
app.options('*', cors());

// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Start the server
app.listen(port, function() {
    console.log("App running on port " + port + "!");
});
