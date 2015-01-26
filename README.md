# RESTyList
*A todo list API for those with better things to do*

## Platform
I used an incomplete MVC framework I wrote a few months ago called [Sauna MVC](https://github.com/LPGhatguy/sauna). The current latest version, 0.1.2, basically just exposes a regex-driven routing engine ("Steamy") and a couple helpful Mongoose schemas.

I chose Sauna so that I could have a non-contrived test for it in the future and because it can deploy to Linux on my favorite cloud host, DigitalOcean.

## Usage
Make sure node.js is installed and in your system's `PATH`.

Open a terminal in the repository and use `npm install` to install dependencies, then run `npm start`. Check `config.js` for configuration options, like changing the server's port.

When testing, I used a Sublime Text 3 build system:
```json
{
	"name": "Run RESTyList",
	"shell_cmd": "start cmd /C \"cd src && npm start & pause\""
}
```

## API
See [DESIGN.md](DESIGN.md) for an abstract API definition.

## cURL Tests:
*Tested with cURL 7.40.0 on Windows*