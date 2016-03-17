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
    elections: "SELECT * FROM " + functions.dbName() + ".`elections`",
    elcreate: "INSERT INTO " + functions.dbName() + ".`elections` (`election_name`, `primary_date`, `final_date`, `runoff_date`) VALUES ",
    elupdate: "UPDATE " + functions.dbName() + ".`elections` SET <> WHERE election_id = ",
    eldelete: "DELETE FROM " + functions.dbName() + ".`elections` WHERE election_id = "
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

router.get('/elections', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }
    var connection = functions.dbConnect(res);

    connection.query(queries.elections, functions.defaultJSONCallback(res));

    connection.end();
});

router.post('/elections/create', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res);

    var data = req.body;

    if (!data) { res.status(204); return; }

    var query = queries.elcreate + functions.constructSQLArray([
            data.election_name, data.primary_date, data.final_date, data.runoff_date
        ]);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "ELECTION_CREATE", "Entitled " + data.election_name +
        ", P | F | R: " + data.primary_date + " | " + data.final_date + " | " + data.runoff_date);

    connection.end();
});

router.put('/elections/update/:election_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res),
        election_id = req.params.election_id;

    var data = req.body;

    if (!data) {
        res.sendStatus(204);
        return;
    }

    var assignments = "`election_name` = " + mysql.escape(data.election_name) + ", `primary_date` = " + mysql.escape(data.primary_date) +
        ", `final_date` = " + mysql.escape(data.final_date) + ", `runoff_date` = " + mysql.escape(data.runoff_date);

    var query = queries.elupdate.replace(/<>/g, assignments) + election_id;

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "ELECTION_MODIFY", "Modified " + election_id + ", named " + data.election_name +
        ", P | F | R: " + data.primary_date + " | " + data.final_date + " | " + data.runoff_date);

    connection.end();
});

router.delete('/elections/delete/:election_id', function (req, res) {
    try {
        if (!functions.verifyPermissions(req).admin) {
            res.sendStatus(401);
            return;
        }

        var connection = functions.dbConnect(res),
            election_id = req.params.election_id;

        var query = queries.eldelete + election_id;

        connection.query(query, functions.defaultJSONCallback(res));

        logger.write(connection, req.session.cas_user, "ELECTION_DELETE", "Deleted " + election_id);

        connection.end();
    } catch (e) {
        console.error(e);
    }
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
