var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    all: "SELECT * FROM " + functions.dbName() + ".`configurations`",
    single: "SELECT * FROM " + functions.dbName() + ".`configurations` WHERE `key` = ",
    update: "UPDATE " + functions.dbName() + ".`configurations` SET <> WHERE `key` = ",
    // have to backtick "key" as it's a reserved keyword; should avoid
};

router.get('/', function (req, res) {

    var connection = functions.dbConnect(res);

    connection.query(queries.all, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/:key', function (req, res) {

    var connection = functions.dbConnect(res),
        key = req.params.key;

    connection.query(queries.single + mysql.escape(key), functions.defaultJSONCallback(res));

    connection.end();
});

router.put('/update/:key', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res),
        key = req.params.key;

    var data = req.body;

    if (!data) {
        res.sendStatus(204);
        return;
    }

    var assignments = "`value` = " + mysql.escape(data.value);

    var query = queries.update.replace(/<>/g, assignments) + "'" + key + "'";

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "SETTINGS_MODIFY", "Modified key " + key + ", to " + data.value);

    connection.end();
});

module.exports = router;
