var t = require('yartf');
var bodyParser = require('body-parser');
var express = require('express');
var should = require('should');
var jsonRes = require('./');
var c = require('casual');
var _ = require('lodash');
var Q = require('q');
var Promise = require('bluebird');

var app = express();

var baseUrl = 'http://localhost:4321';
var port = 4321;

app.use(bodyParser());
app.listen(port);

describe('Responses', function () {
	it('should response with specified data', function (done) {
		var randomString = c.string;

		// Simple json res
		app.get('/', jsonRes(function () {
			return { a: randomString };
		}));

		t(baseUrl)
			.get('/')
			.as('sample')
			.assert(function(res) {
				res.sample.status.should.be.exactly(200);
				res.sample.body.a.should.be.equal(randomString);
			})
			.exec(done);
	});

	it('should response back passed params', function (done) {
		var testData = {
			a: c.string,
			b: c.card_data
		};

		app.post('/pass-back', jsonRes(function (params) {
			return params;
		}));

		t(baseUrl)
			.post('/pass-back', testData)
			.as('passBack')
			.assert(function(res, sample) {
				res.passBack.status.should.be.exactly(200);
				_.isEqual(res.passBack.body, testData).should.be.ok;
			})
			.exec(done);
	});

	it('should response back passed params with Q', function (done) {
		var testData = {
			a: c.string,
			b: c.card_data
		};

		app.post('/pass-back', jsonRes(function (params) {
			return Q(params);
		}));

		t(baseUrl)
			.post('/pass-back', testData)
			.as('passBack')
			.assert(function(res) {
				res.passBack.status.should.be.exactly(200);
				_.isEqual(res.passBack.body, testData).should.be.ok;
			})
			.exec(done);
	});

	it('should response back passed params with bluebird', function (done) {
		var testData = {
			a: c.string,
			b: c.card_data
		};

		app.post('/pass-back', jsonRes(function (params) {
			return Promise.resolve(params);
		}));

		t(baseUrl)
			.post('/pass-back', testData)
			.as('passBack')
			.assert(function(res) {
				res.passBack.status.should.be.exactly(200);
				_.isEqual(res.passBack.body, testData).should.be.ok;
			})
			.exec(done);
	});


	it('should response with 500', function (done) {
		app.post('/error', jsonRes(function (params) {
			throw new Error('lol wat');
		}));

		t(baseUrl)
			.post('/error')
			.as('error')
			.assert(function(res) {
				res.error.status.should.be.exactly(500);
			})
			.exec(done);
	});

	it('should response with 500 rejected Q promise', function (done) {
		app.post('/error', jsonRes(function (params) {
			var deferred = Q.defer();
			deferred.reject('lol wat');
			return deferred.promise;
		}));

		t(baseUrl)
			.post('/error')
			.as('error')
			.assert(function(res) {
				res.error.status.should.be.exactly(500);
			})
			.exec(done);
	});

	it('should response with 500 rejected bluebird promise', function (done) {
		app.post('/error', jsonRes(function (params) {
			Promise.reject('lol wat');
		}));

		t(baseUrl)
			.post('/error')
			.as('error')
			.assert(function(res) {
				res.error.status.should.be.exactly(500);
			})
			.exec(done);
	});
});
