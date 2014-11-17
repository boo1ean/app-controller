var _ = require('lodash');

function defaultErrorHandler (req, res, err) {
	res.status(500).end();
	console.error(err);
}

// Wrap function with autoresponse with promises and error handling
function wrap (action, errorHandler) {
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

// Wrap function or functions object
function adapt (controller, errorHandler) {
	if (errorHandler && !_.isFunction(errorHandler)) {
		throw new Error('Error handler should be a function');
	}

	errorHandler = errorHandler || defaultErrorHandler;

	if (_.isFunction(controller)) {
		return wrap(controller, errorHandler);
	}

	if (!_.isObject(controller)) {
		throw new Error('Controller must be function or object of functions');
	}

	var result = {};
	for (var name in controller) {
		result[name] = wrap(controller[name], errorhandler);
	}

	return result;
}

module.exports = adapt;
