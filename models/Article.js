const mongoose = require("mongoose"),
      Schema = mongoose.Schema
      
var article = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
})

var Article = mongoose.model("Article", article);

// Export the Article model
module.exports = Article;