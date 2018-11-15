var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// // Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.set("views", __dirname + "/views");
app.engine("handlebars", exphbs({ defaultLayout: "main", layoutsDir: __dirname + "/views/layouts"}));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Routes
app.get("/", (req, res) => {
    res.redirect("/articles");
});

app.get("/scrape", (req, res) => {
// Make a request via axios to grab the HTML body from the New York Times
    axios.get("https://www.nytimes.com").then(function(response) {

    // Load the HTML into cheerio and save it to a variable
    var $ = cheerio.load(response.data);

    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
    $("article.css-180b3ld").each(function(i, element) {
        var result = {};

        result.title = $(this).children().text();
        result.summary = $(this).find("li").text() || $(this).find("p").text();
        result.link = $(this).find("a").attr("href");

        db.Article.create(result)
        .then(dbArticle => console.log(dbArticle))
        .catch(err => console.log(err));
    });

    console.log("=============");
    console.log("Scrape successful.")
    res.redirect("/articles");

    });
});

app.get("/articles", (req, res) => {
    db.Article.find({})
    .exec((err, doc) => {
        if(err){
            console.log(err);
        }
        else{
            var artcl = {Article: doc};
            res.render("index", artcl);
        }
    })
});

app.get("/articles/:id", (req, res) => {
    let articleId = req.params.id;

    db.Article.find({_id: articleId})
    .populate("comment")
    .exec((err, doc) => {
        if (err){
            console.log(err);
        }
        else{
            var hbsObj = {Article: doc};
            res.render("comments", hbsObj);
        }
    })
});

app.post("/articles/:id", (req, res) => {
    let title = req.body.title;
    let body = req.body.body;
    let articleId = req.params.id;

    var commentObj = {
        title: title,
        body: body
    };

    db.Comment.create(commentObj).then(dbComment => {
        db.Article.findOneAndUpdate({_id: articleId}, {comment: dbComment._id}, 
        (err, doc) => {
            if (err){
                console.log(err);
            }
            else{
                console.log("Comment added successfully.");
                res.redirect("/articles/" + articleId);
            }
        })
    })

    
});

app.get("/delete/:id", (req, res) => {
    db.Comment.deleteOne({_id: req.params._id})
    .exec((err, doc) => {
        if (err){
            console.log(err);
        }
        else{
            console.log("Comment deleted.");
            res.redirect("/articles");
        };
    });
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
