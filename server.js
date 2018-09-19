var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Require Article and Comment models
var Article = require("./models/newsArticle.js");
var Comment = require("./models/comment.js");
// Scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose !!!!!!!!!**********

// ---CHANGE THIS!!!
mongoose.connect("mongodb://heroku_ww7pvmbt:gplc7ga009dnb0l901f3sor8j1@ds135364.mlab.com:35364/heroku_ww7pvmbt");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ==================================================
// ++++++GET request to scrape Outdoor Gear Lab website
app.get("/scrape", function(req, res) {
  request("https://www.npr.org/sections/news/", function(error, response, html) {
    if (error) {
      console.log(error);
    };

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var result = {};

    // With cheerio, find each div-tag with the ".has-image" class
    // (i: iterator. element: the current element)
    $(".has-image").each(function(i, element) {

      result.title = $(element).children(".item-info").children(".title").children().text();
      result.description = $(element).children(".item-info").children(".teaser").children("a").text();
      result.link = $(element).children(".item-info").children(".title").children().attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });
    });

    // Tell the browser that we finished scraping the text
    res.send("Scape complete");
  });
});


// +++++++++GET request to grab all the articles we scraped from the database
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// ++++++++GET request to grab a particular article by id
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// +++++++++POST request to create a new note or replace an existing one
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newComment = new Comment(req.body);

  // And save the new note the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});






// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});