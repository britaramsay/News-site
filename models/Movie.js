const mongoose = require("mongoose"),
      Schema = mongoose.Schema
      
var movie = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true 
    },
    genre: {
        type: String
    },
    synopsis: {
        type: String
    },
    photo: {
        type: String
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
})

var Movie = mongoose.model("Movie", movie);

// Export the Movie model
module.exports = Movie;