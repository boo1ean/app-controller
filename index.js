var _ = require('lodash');

var responders = {
	'POST': responsePOST,
	'GET': responseGET,
	'PUT': responsePUT,
	'DELETE': responsePUT,
	'PATCH': responsePUT
};

function responsePOST (data, res) {
	return res.status(201).json(data);
}

function responseGET (data, res) {
	if (!data) {
		return res.status(404).end();
	}

	return res.status(200).json(data);
}

function responsePUT (data, res) {
	if (!data) {
		return res.status(204).end();
	}

	return res.status(200).json(data);
}

// Wrap function with autoresponse with promises and error handling
function wrap (pickProps, action) {
	if (!_.isFunction(action)) {
		throw new Error('Controller action must be a function but ' + typeof action + ' is given');
	}

	return function wrapAction (req, res, next) {

		// Gather all possible params to a single object
		var params = pickProps(req);

		try {
			// Execute handler
			var result = action(params, req, res);

			// Check if result is promise then do chaining
			if (!_.isUndefined(result) && _.isFunction(result.then)) {
				result.then(onFulfilled, onRejected);
			} else {
				onFulfilled(result);
			}

		} catch (err) {
			onRejected(err);
		}

		// Success handler
		function onFulfilled (data) {
			// If headers are already sent, just noop
			if (res.headersSent) {
				return;
			}

			// Response with json
			responders[req.method](data, res);
		}

		// Error handler
		function onRejected (err) {
			next(err);
		}
	}
}

// Wrap function or functions object
function wrapAll (pickProps, controller) {
	if (_.isFunction(controller)) {
		return wrap(pickProps, controller);
	}

	if (!_.isObject(controller)) {
		throw new Error('Controller must be function or object of functions');
	}

	var result = {};
	for (var name in controller) {
		result[name] = wrap(pickProps, controller[name]);
	}

	return result;
}

function configure (pickProps) {
	return wrapAll.bind(wrapAll, pickProps);
}

function defaultPickProps (req) {
	return _.extend({}, req.params, req.query, req.body);
}

module.exports = wrapAll.bind(wrapAll, defaultPickProps);
module.exports.configure = configure;
