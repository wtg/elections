var app = require('../app.js');
var request = require('supertest')(app);
var should = require('chai').should();

describe('offices API', function() {
	it('should return a list of offices', function(done) {
		request
			.get('/api/offices')
			.expect('Content-Type', /json/)
			.expect(200)
			.expect(function(res) {
				res.body.length.should.be.above(0);

				var properties = [
					'office_id',
					'election_id',
					'name',
					'description',
					'openings',
					'nominations_required',
					'type',
					'disabled'
				];

				for (var i = 0; i < res.body.length; ++i) {
					for (var j = 0; j < properties.length; ++j) {
						res.body[i].should.have.property(properties[j]);
						res.body[i][properties[j]].should.exist;
					}
				}
			}).end(done);
	});
});

describe('candidates API', function() {
	it('should return an empty list of candidates', function(done) {
		request
			.get('/api/candidates')
			.expect(200, [], done);
	});

});

describe('users API', function() {
	it('should return unauthenticated info when not logged in', function(done) {
		request
			.get('/api/users')
			.expect(200, {
	            'authenticated': false,
	            'username': null,
	            'admin': false
	        }, done);
	});
});