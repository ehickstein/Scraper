// Initializing mongoose
var mongoose = require("mongoose");

// Defining the schema keyword from mongoose
var Schema = mongoose.Schema;

// Defining the Article schema
var ArticleSchema = new Schema({
// Title is a string, and is required
  title: {
    type: String,
    required: true
  },
/* Summary is a string, and is not required. The NYT sometimes
does not post summaries for their articles */
  summary: {
    type: String,
    required: false
  },
// Link is a string, and is required
  link: {
    type: String,
    required: true
  },
/* Comment references our other model, and allows us to insert
comments into article objects */
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }
});

// Creates a new mongoose model for the Article schema
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
