// Mongoose Schema for the Entry object

var mongoose = require("mongoose");

var entrySchema = mongoose.Schema({
	title: {type: String, required: true},
	description: {type: String, required: true},
	complete: {type: Boolean, default: false},

	created: {type: Date, default: Date.now},
	updated: {type: Date, default: Date.now}
});

// This should be called whenever the entry is updated
entrySchema.methods.touch = function() {
	this.updated = Date.now;
}

// Creates an object that's safe to send to a user
entrySchema.methods.toSendable = function() {
	var sendable = this.toObject();

	sendable.id = sendable._id;
	delete sendable._id;

	return sendable;
}

// Update our last updated field
entrySchema.pre("save", function(next) {
	this.updated = Date.now;

	next();
});

var Entry = mongoose.model("Entry", entrySchema);

module.exports = Entry;