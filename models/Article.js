var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	link: {
		type: String,
		required: true,
	},
	desc: String,
	author: String,
	comments: [{
		type: Schema.Types.ObjectId,
		ref: "Comment",
	}],
});

module.exports = mongoose.model("Article", ArticleSchema);
