var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js');

var queries = {
    all: "SELECT * FROM `offices`",
    election: " WHERE election_id = ",
    office: " WHERE office_id = ",
    active_election: "(SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')",
    types: "SELECT DISTINCT type FROM `offices` WHERE NOT type = 'all'",

    post: "INSERT INTO `rpielections`.`offices` (`election_id`, `name`, `description`, `openings`, " +
    "`nominations_required`, `type`, `disabled`) VALUES ",
    update: "UPDATE offices SET <> WHERE office_id = ",
    toggle: "UPDATE offices SET disabled = IF((SELECT disabled WHERE office_id = @), 0, 1) WHERE office_id = @",
    remove: "DELETE FROM `rpielections`.`offices` "
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

router.post('/create', function (req, res) {
    var connection = functions.dbConnect(res);

    var data = req.body;

    if (!data) res.status(204);

    var query = queries.post + functions.constructSQLArray([1, data.name, data.description,
                                                  data.openings, data.nominations_required, data.type, data.disabled]);

    connection.query(query, functions.defaultJSONCallback(res));

    connection.end();
});

router.put('/update/:office_id', function(req, res) {
    var connection = functions.dbConnect(res),
        office_id = req.params.office_id;

    var data = req.body;

    if (!data) res.status(204);

    var assignments = "`name` = " + mysql.escape(data.name) + ", " +
                      "`description` = " + mysql.escape(data.description) + ", " +
                      "`openings` = " + mysql.escape(data.openings) + ", " +
                      "`nominations_required` = " + mysql.escape(data.nominations_required) + ", " +
                      "`type` = " + mysql.escape(data.type);

    var query = queries.update.replace(/<>/g, assignments) + mysql.escape(office_id);

    connection.query(query, functions.defaultJSONCallback(res));

    connection.end();
});

router.put('/toggle/:office_id', function (req, res) {
    var connection = functions.dbConnect(res),
        office_id = req.params.office_id;

    var query = queries.toggle.replace(/@/g, mysql.escape(office_id));

    connection.query(query, functions.defaultJSONCallback(res));

    connection.end();
});

router.delete('/delete/:office_id', function (req, res) {
    var connection = functions.dbConnect(res),
        office_id = req.params.office_id;

    var query = queries.remove + queries.office + mysql.escape(office_id);

    connection.query(query, functions.defaultJSONCallback(res));

    connection.end();
});

module.exports = router;