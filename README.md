# RESTyList
*A todo list API for those with better things to do*

## Platform
I used an incomplete MVC framework I wrote a few months ago called [Sauna MVC](https://github.com/LPGhatguy/sauna). The current latest version, 0.2.3, basically just exposes a regex-driven routing engine ("Steamy") and a couple helpful Mongoose schemas.

I chose Sauna so that I could have a non-contrived test for it in the future and because it can deploy to Linux really easily. Had I not been super excited to try to use Sauna, I probably would've went with something like Express.

## Usage
Make sure node.js is installed and in your system's `PATH`.

Configure your MongoDB installation in `config.js` and make sure your daemon is running (`mongod`).

Open a terminal in the repository and use `npm install` to install dependencies, then run `npm start`. Check `config.js` for configuration options, like changing the server's port.

When testing, I use a Sublime Text 3 build system:
```json
{
	"name": "Run RESTyList",
	"shell_cmd": "start cmd /C \"cd src && npm start & pause\""
}
```

## API
See [DESIGN.md](DESIGN.md) for an abstract API definition.

## Deployment
From start to finish on a fresh DigitalOcean Ubuntu 14.04 server, the application can be run with:
```bash
apt-get update
apt-get install nodejs npm git mongodb
git clone RESTyList
cd RESTyList

mongod --fork --dbpath /var/lib/mongodb --logpath /var/log/mongodb.log --logappend
nodejs index.js
```

## cURL Tests:
*Tested with cURL 7.40.0 on Windows*

Substitute ROOT with the URL of the service. Locally, it will default to `localhost:4000`.

All HTTP verbs can be replaced with an extra trailing item.

These requests are the same:
- `DELETE URL/api/items?id=5`
- `GET URL/api/items/delete?id=5`
- `POST URL/api/items/delete?id=5`

Create item:
- `curl -X POST --data "{\"title\":\"Test\", \"desc\":\"Testing Item #1\", complete:false}" URL/api/items`

Read item:
- `curl -X GET URL/api/items?id=ID`

Update item:
- `curl -X PUT --data "{\"title\":\"Test Updated\", description:\"Testing Item (Updated)\", \"complete\":false}" URL/api/items?id=ID`

Delete item:
- `curl -X DELETE URL/api/items?id=ID`

Query for items:
- `curl -X POST URL/api/items/query`
	- Returns the first 50 items
- `curl -X POST --data "{\"where\":{\"complete\": false}}" URL/api/items/query`
	- Yields all entries that are not complete.
- `curl -X POST --data "{\"like\":{\"description\": \"Test\"}}" URL/api/items/query`
	- Yields all entries that have "Test" in their description
- See [DESIGN.md](DESIGN.md) for more details on the query format.

Change item completeness:
- `curl -X POST URL/api/items/complete?id=ID`
or
- `curl -X POST URL/api/items/uncomplete?id=ID`

Alternatively, you can use an update command, but it's a little less semantic:
- `curl -X PUT --data "{complete: true}" URL/api/items?id=ID`

## Potential Improvements
Desirable additional features include:
- Batch complete/uncomplete tasks
- Batch delete task
- Authentication and multiple list support
- Pagination by date for better scaling, since the current implementation uses Mongoose's `skip` and `limit` clauses
- Tests more formal than a bunch of cURL calls
- Take advantage of Mongoose's findByIdAndUpdate and findByIdAndRemove