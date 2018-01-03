var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;
var app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/news-scraper", {
  useMongoClient: true,
});

app.get("/", (req, res) => {
	var url = "https://www.wired.com/most-popular/";
	
	request(url, function(error, response, html) {
		var $ = cheerio.load(html);
		
		//var articles = [];
		
		$("li.archive-item-component").each((i, element) => {
			let articleElement = $(element);
			let article = {};
			
			let info = articleElement.children("div.archive-item-component__info").children("a.archive-item-component__link");
			
			article.link = "https://www.wired.com" + info.attr("href");
			article.title = info.children("h2.archive-item-component__title").text();
			article.desc = info.children("p.archive-item-component__desc").text();
			article.author = articleElement.children("div.archive-item-component__info").children("div.archive-item-component__byline").children("span").children("div.byline-component--micro").children("span.byline-component__content[itemprop='author']").children("a.byline-component__link").text();
			
			db.Article.update({title: article.title}, article, {upsert: true, setDefaultsOnInsert: true}).then(result => {});
			//articles.push(article);
		});
		
		db.Article.find({}).then(dbArticles => {
			//console.log(dbArticles);
			res.render("index", {articles: dbArticles});
		});
	});
});

app.post("/articles/:id", (req, res) => {
	db.Comment.create(req.body).then(dbComment => {
		return db.Article.findOneAndUpdate({_id: req.params.id}, {'$push': {comments: dbComment._id}}, { new: true });
    }).then(dbArticle => {
		res.json(dbArticle);
	}).catch(function(err) {
		res.json(err);
	});
});

app.get("/articles/:id", (req, res) => {
	db.Article.findOne({_id: req.params.id}).populate("comments").then((dbArticle) => {
		res.json(dbArticle);
	}).catch((err) => {
		res.json(err);
	});
});

app.delete("/comments/:id", (req, res) => {
	db.Comment.findByIdAndRemove(req.params.id).then(result => {
		res.json(true);
	}).catch((err) => {
		res.json(err);
	});
});

app.listen(PORT, function() {
  console.log("Server listening on port " + PORT);
});
