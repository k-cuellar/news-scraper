// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;


// Create schema
var ArticleSchema = new Schema({
  // article title
  title: {
    type: String,
    required: true
  },
  // link to article
  link: {
    type: String,
    required: true
  },
  // description of article
  description: {
    type: String,
    required: false
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// Create the model with the Schema from above
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;