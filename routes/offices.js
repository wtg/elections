var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js');

var queries = {
    all: "SELECT * FROM `offices`",
    election: " WHERE election_id = ",
    types: "SELECT DISTINCT type FROM `offices` WHERE NOT type = 'all'"
};

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.all, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/election/:election_id', function (req, res) {
    var connection = functions.dbConnect(res),
        election_id = req.params.election_id;

    connection.query(queries.all + queries.election + mysql.escape(election_id), functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/types', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.types, functions.defaultJSONCallback(res));

    connection.end();
});

module.exports = router;