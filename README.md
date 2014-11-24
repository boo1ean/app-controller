## app-controller

Part of app helpers project.


Simplify express route handlers.  
Aggregate request params into single object (params, body, query).   
Takes care of response sending.   
Works with promises.   
You only need to return value from route handler.

## Installation

```
npm install app-controller
```

## Usage

```javascript
var app = require('express')();
var adapt = require('app-controller');
var bodyParser = require('body-parser');
var Promise = require('bluebird');

app.use(bodyParser());

// Response body will be json array -> [1, 2, 3]
app.get('/numbers', adapt(function(params, req) {
	return [1,2,3];
}));

// Same with promise -> [1, 2, 3]
app.get('/numbers', adapt(function(params, req) {
	return Promise.resolve([1,2,3]);
}));

// Use params
// GET /numbers?pivot=2 -> [3]
app.get('/numbers', adapt(function(params, req) {
	return [1, 2, 3].filter(function(n) {
		return n > params.pivot;
	});
}));

// POST /login
// Request body:
// username: johny
// password: qwerty
app.post('/login', adapt(function(params, req) {
	return someAsyncAuthChecker(params.username, params.password).then(function() {
		return { success: true };
	});
}));

// And so on..
```

## License
MIT
