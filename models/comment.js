// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var CommentSchema = new Schema({
  // title, not required
  title: {
    type: String
  },
  // body, not required
  body: {
    type: String
  }
});

// Mongoose will automatically save the ObjectIds of the notes
// These ids are referred to in the Article model

// Create the Note model with the NoteSchema
var Comment = mongoose.model("Note", CommentSchema);

// Export the Note model
module.exports = Comment;