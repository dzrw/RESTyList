// RESTyList Configuration
// Not JSON because JSON hates comments
var config = {
	// Web server configuration
	webConfig: {
		httpsEnabled: false,
		httpPort: 4000
	},

	// MongoDB/Mongoose configuration
	mongoPath: "mongodb://localhost/test",
	mongoConfig: {
		server: {
			socketOptions: {
				keepAlive: 1
			}
		},
		replset: {
			socketOptions: {
				keepAlive: 1
			}
		}
	}
};

module.exports = config;