// Initializing mongoose
var mongoose = require("mongoose");

// Starting a new schema
var Schema = mongoose.Schema;

// Defining the new schema
var CommentSchema = new Schema({
  title: String,
  body: String
});

// Creating the mongoose.model for the new schema
var Comment = mongoose.model("Comment", CommentSchema);

// Export the Note model
module.exports = Comment;
