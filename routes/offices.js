var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js');

var queries = {
    all: "SELECT * FROM `offices`",
    election: " WHERE election_id = ",
    active_election: "(SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')",
    types: "SELECT DISTINCT type FROM `offices` WHERE NOT type = 'all'",

    post: "INSERT INTO `rpielections`.`offices` (`election_id`, `name`, `description`, `openings`, " +
    "`nominations_required`, `type`, `disabled`) VALUES "
};

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.all, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/election/active', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.all + queries.election + queries.active_election, functions.defaultJSONCallback(res));

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

router.post('/', function (req, res) {
    var connection = functions.dbConnect(res);

    var data = req.body.data;

    if (!data) res.status(204);

    var query = queries.post + "(" + data.election_id + ", '" + "Test', 'test', '1', '125', '2020', '1')";
});

module.exports = router;