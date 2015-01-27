// Shorthand methods for throwing different errors

var Sauna = require("sauna");
var WebError = Sauna.WebError;
var createError = WebError.generators.json;

var errors = {
	invalidJSON: function(request, response) {
		response.writeHead("400", {"Content-Type": "application/json"});
		response.write(createError("400", "Invalid JSON", "The JSON you sent in the request body was not valid."));
		response.end();
	},

	invalidID: function(request, response) {
		response.writeHead("400", {"Content-Type": "application/json"});
		response.write(createError("400", "Bad ID", "This request requires an ID parameter, which was not specified."));
		response.end();
	},

	notFound: function(request, response) {
		// Nasty hack: yieldErrorPage uses the request 'accept' header to determine content type
		// we know they want JSON
		request.headers.accept = "application/json";
		WebError.yieldErrorPage("404", request, response);
	},

	internalError: function(request, response) {
		// Nasty hack: yieldErrorPage uses the request 'accept' header to determine content type
		// we know they want JSON
		request.headers.accept = "application/json";
		WebError.yieldErrorPage("500", request, response);
	},

	detailedError: function(request, response, details) {
		response.writeHead("400", {"Content-Type": "application/json"});

		var error = {
			error: true,
			code: "400",
			title: "JSON Error",
			body: details
		};
		response.write(JSON.stringify(error));
		response.end();
	}
};

module.exports = errors;