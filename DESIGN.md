# RESTyList API Design
- /api/items:
	- POST:
		- Create a new item with data passed through the request body. (CREATE)
	- GET {id}:
		- Returns the item with this identifier. (READ)
	- PUT {id}:
		- Updates the item with this identifier, but only if it already exists. (UPDATE)
	- DELETE {id}:
		- Deletes the item with this identifier. (DELETE)

	- query:
		- POST:
			- Submits a query given a query object in JSON format.

	- complete:
		- POST {id}:
			- Complete ('check') the item with the given ID.

	- uncomplete:
		- POST {id}:
			- Uncomplete ('uncheck') the item with the given ID.

## API Result Format
**On success:**
```json
{
	"result": RESULT
}
```
If the operation was a read operation, `result` will contain that data.
If the operation was a write operation, `result` will be a boolean value telling whether it worked.

**On error:**
```json
{
	"error": true,
	"code": "CODE",
	"title": "Error Title",
	"description": "Detailed error, might be a dictionary."
}
```

## Entry Object
Each todo list entry has the following properties:

- `created`: The date the entry was created.
- `updated`: The date the entry was last updated.
- `title`: The title of the todo list entry.
- `description`: The detailed description of the todo list entry.
- `complete`: Whether the item is complete.
- `id`: The ID the object, a hash.

## Query Object
A query object is a regular JSON dictionary with some specific keys:

- `where`: Dictionary mapping keys to exact matches in the entry. Use this for checking for an ID, task completeness, or an exact match in title or description.
- `like`: Dictionary mapping keys to case-insensitive regular expressions to match against in the entry. Use this for searches.
- `sort`: The keys and directions to sort by; defaults to `-created`. See the [Mongoose Docs](http://mongoosejs.com/docs/api.html#query_Query-sort) for more details.
- `limit`: The number of entries to get; defaults to 50. Pass "all" to return all results. Can be used to paginate.
- `skip`: The number of entries to skip; defaults to 0. Used to paginate lightly, but may have scaling issues.