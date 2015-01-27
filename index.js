"use strict";

/*
This code may be overdocumented.
It uses a framework that no one else has probably laid eyes on,
even though it's technically published in npm.

Where APIs are unclear or potentially unconventional I try to provide insight.
*/

var config = require("./config"); // Application Configuration
var errors = require("./errors"); // Errors our application can yield

var Sauna = require("sauna");
var Server = Sauna.Server; // Wrapper for HTTP(S) servers
var RouteMatcher = Sauna.RouteMatcher; // Defines routing syntaxes
var RouteHandler = Sauna.RouteHandler; // Defines routing handlers, mostly helpers
var WebError = Sauna.WebError; // Provides error generators

var Entry = require("./Models/Entry"); // Model object for a list entry

// Connect to our database!
var mongoose = require("mongoose");
mongoose.connect(config.mongoPath, config.mongoConfig);

var db = mongoose.connection;

// Utility method to return a successful JSON result.
function jsonSuccess(request, response, body) {
	response.writeHead("200", {"Content-Type": "application/json"});
	response.write(body);
	response.end();
}

// Updates an entry from a given request given an id and values to update.
// Used in:
// PUT /api/items
// POST /api/items/complete
// POST /api/items/uncomplete
function entryUpdate(request, response, id, object) {
	Entry.update({_id: id}, object, {multi: false}, function(err, affected) {
		if (err) {
			errors.internalError(request, response);
			return console.error(err);
		}

		// Did we update anything?
		// If not, it means the resource wasn't found.
		if (affected > 0) {
			var result = {
				result: true
			};

			jsonSuccess(request, response, JSON.stringify(result));
		} else {
			errors.notFound(request, response);
		}
	});
}

// Define our entire API in a service
// See DESIGN.md for a more abstract definition, or README.md for curl commands.
var service = {
	api: {
		items: {
			// POST api/items
			// Create a new item given a JSON body.
			post: function(request, response, url, parameters) {
				var object;

				try {
					object = JSON.parse(url.body);
				} catch(e) {
					errors.invalidJSON(request, response);
					return;
				}

				var entry = new Entry(object);

				entry.save(function(err, entry) {
					if (err) {
						errors.detailedError(request, response, err);
						console.error(err);
					}

					var result = {
						result: true
					}

					jsonSuccess(request, response, JSON.stringify(result));
				});
			},

			// GET api/items?id=ID
			get: function(request, response, url, parameters) {
				var id = url.id;

				// No ID
				if (!id || id.length == 0) {
					return errors.invalidID(request, response);
				}

				Entry.findOne({_id: id})
				.exec(function(err, entry) {
					if (err) {
						// This is most likely a cast error with the ID
						errors.notFound(request, response);
						return console.error(err);
					}

					if (!entry) {
						errors.notFound(request, response);
					}

					var result = {
						result: entry.toSendable()
					};

					jsonSuccess(request, response, JSON.stringify(result));
				});
			},

			// PUT api/items?id=ID
			// Update an existing item given a JSON body.
			put: function(request, response, url, parameters) {
				var id = url.id;

				// No ID in the request
				if (!id || id.length == 0) {
					return errors.invalidID(request, response);
				}

				var object;

				// Parse the object we're trying to put into the database.
				try {
					object = JSON.parse(url.body);
				} catch(e) {
					errors.invalidJSON(request, response);
					return;
				}

				if (typeof object != "object") {
					// This is probably a JSON list
					// For our purposes this is "invalid" JSON
					errors.invalidJSON(request, response);
					return;
				}

				// Update the entry in our database
				entryUpdate(request, response, id, object);
			},

			// DELETE api/items?id=ID
			// Delete an existing item.
			delete: function(request, response, url, parameters) {
				var id = url.id;

				// No ID in the request
				if (!id || id.length == 0) {
					return errors.invalidID(request, response);
				}

				Entry.remove({_id: id}, function(err) {
					if (err) {
						errors.notFound(request, response);
					} else {
						var result = {
							result: true
						};

						jsonSuccess(request, response, JSON.stringify(result));
					}
				});
			},

			query: {
				// POST api/items/query
				// Search for entries that match a query object.
				// Pass nothing to get the first 50 objects sorted by date created.
				// See DESIGN.md for details on that format.
				post: function(request, response, url, parameters) {
					var object;

					try {
						object = JSON.parse(url.body);
					} catch(e) {
						if (url.body.length == 0) {
							object = {};
						} else {
							errors.invalidJSON(request, response);
							return;
						}
					}

					if (typeof object != "object") {
						// This is probably a JSON list
						// For our purposes this is "invalid" JSON
						errors.invalidJSON(request, response);
						return;
					}

					var where = object.where || {};
					var like = object.like || {};
					var sort = object.sort || "-created";
					var limit = object.limit || 50;
					var skip = object.skip || 0;

					// The 'like' key uses regexp matching
					for (var key in like) {
						if (like.hasOwnProperty(key)) {
							like[key] = new RegExp(like[key], "i");
						}
					}

					// Search for the entry the user specified
					var query = Entry.find(where)
					.where(like)
					.sort(sort)
					.skip(skip)
					.select("id title description updated created complete");

					// limit must be either nothing, a number, or "all"
					if (typeof limit == "number") {
						query.limit(limit);
					} else if (limit != "all") {
						errors.detailedError(request, response, "If specified, 'limit' must be a number, or the string 'all'");
						return;
					}

					query.exec(function(err, entries) {
						if (err) {
							errors.internalError(request, response);
							return console.error(err);
						}

						// Transform entries to sendable objects
						for (var i = 0; i < entries.length; ++i) {
							entries[i] = entries[i].toSendable();
						}

						var result = {
							result: entries
						};

						jsonSuccess(request, response, JSON.stringify(result));
					});
				}
			},

			complete: {
				// POST api/items/complete?id=ID
				// Mark the entry as complete.
				// Equivalent to an update with the complete field set to true.
				post: function(request, response, url, parameters) {
					var id = url.id;

					// No ID
					if (!id || id.length == 0) {
						return errors.invalidID(request, response);
					}

					entryUpdate(request, response, id, {complete: true});
				}
			},

			uncomplete: {
				// POST api/items/complete?id=ID
				// Mark the entry as not complete.
				// Equivalent to an update with the complete field set to false.
				post: function(request, response, url, parameters) {
					var id = url.id;

					// No ID
					if (!id || id.length == 0) {
						return errors.invalidID(request, response);
					}

					entryUpdate(request, response, id, {complete: false});
				}
			}
		}
	},

	// GET /* (not api): Return files from ./static
	get: RouteHandler.staticDirectory("./static", {directoryBehavior: "index.html"})
};

// Wire up a route for our service.
// This syntax should really be documented, because it looks a little cryptic.
var serviceMatcher = RouteMatcher.fromSteamyRoute("/{path:accordion,optional}$")

// Create a definition of where this route should go.
// In this case, it should navigate through our service object we defined above.
var serviceHandler = RouteHandler.dynamic(service);

// Add the route to our server object
Server.addRoute(serviceMatcher, serviceHandler)

// Wire up a JSON 404 for the API
var apiMissingMatcher = RouteMatcher.fromRegExp("^/api")
var apiMissingHandler = RouteHandler.staticContent(WebError.getErrorPage("404", "json"), "404", "application/json");
Server.addRoute(apiMissingMatcher, apiMissingHandler, 1);

// By default, Sauna throws a 500 if no handlers match, so we provide one to 404.
// This is an HTML 404.
var missingMatcher = RouteMatcher.all();
var missingHandler = RouteHandler.staticContent(WebError.getErrorPage("404", "html"), "404", "text/html");

// Third parameter determines priority; 404 should come after everything else.
Server.addRoute(missingMatcher, missingHandler, 2);

// Check for errors from Mongoose
db.on("error", console.error.bind(console, "connection error:"));

// Start the server over HTTP once we make contact with MongoDB.
db.once("open", function main() {
	Server.start(config.webConfig);
});