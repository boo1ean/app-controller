var t = require('yartf');
var bodyParser = require('body-parser');
var express = require('express');
var should = require('should');
var jsonRes = require('./');

var app = express();

var baseUrl = 'http://localhost:4321';
var port = 4321;

app.listen(port);


describe('Responses', function () {
	it('should response with 200 status', function (done) {
		// Simple json res
		app.get('/', jsonRes(function () {
			return { a: 'b' };
		}));

		t(baseUrl)
		.get('/')
		.as('sample')
		.assert(function(res, sample) {
			res.sample.status.should.be.exactly(200);
			res.sample.body.a.should.be.equal('b');
		})
		.exec(done);
	});
});
