// Club Management System API operations
var https = require('https'),
    Q = require('q'),
    token = require('./token.js');

var defaults = {
    method: "GET",
    host: 'cms.union.rpi.edu',
    headers: {
        "Authorization": "Token " + token,
        "Content-Type": "application/json"
    }
};

var endpoints = {
    rcs: '/api/users/view_rcs/%/',
    rin: '/api/users/view_rin/%/',
    wtg: '/api/users/get_if_wtg/%/',
    rne: '/api/users/get_if_rne/%/'
};

module.exports = {
    getRCS: function (rcs_id) {
        var options = {
            method: defaults.method,
            host: defaults.host,
            path: endpoints.rcs.replace(/%/g, rcs_id),
            headers: defaults.headers
        };


        var deferred  = Q.defer();

        var req = https.request(options, function(response) {
            response.setEncoding('utf8');

            var responseData = '';

            response.on('data', function(data) {
                responseData += data;
            });

            response.on('end', function() {
                deferred.resolve(responseData);
            });
        });

        req.on('error', function(err) {
            deferred.reject(err);
        });

        req.end();

        return deferred.promise;
    }
};