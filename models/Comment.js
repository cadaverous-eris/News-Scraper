var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
	body: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Comment", NoteSchema);
