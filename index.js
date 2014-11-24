var _ = require('lodash');

// Wrap function with autoresponse with promises and error handling
function wrap (action) {
	return function wrapAction (req, res) {

		// Gather all possible params to a single object
		var params = _.extend({}, req.params, req.query, req.body);

		try {
			// Execute handler
			var result = action(params, req.user, req);

			// Check if result is promise then do chaining
			if (typeof result.done === 'function') {
				result.done(onFulfilled, onRejected);
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
			res.json(data);
		}

		// Error handler
		function onRejected (err) {
			errorHandler(req, res, err);
		}
	}
}

// Error handler
function errorHandler (req, res, err) {
	// In case of failed app-validation
	if (err && err.errors) {
		res.status(400).json(err);
	} else {
		console.error(err);
		res.status(500).end();
	}
}

// Set global error handler (for all actions)
function setErrorHandler (handler) {
	if (handler && !_.isFunction(handler)) {
		throw new Error('Error handler should be a function');
	}

	errorHandler = handler;
}

// Wrap function or functions object
function wrapAll (controller) {
	if (_.isFunction(controller)) {
		return wrap(controller);
	}

	if (!_.isObject(controller)) {
		throw new Error('Controller must be function or object of functions');
	}

	var result = {};
	for (var name in controller) {
		result[name] = wrap(controller[name]);
	}

	return result;
}

module.exports = wrapAll;
module.exports.setErrorHandler = setErrorHandler;
