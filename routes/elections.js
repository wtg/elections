var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    all: "SELECT * FROM " + functions.dbName() + ".`elections`",
    create: "INSERT INTO " + functions.dbName() + ".`elections` (`election_name`, `primary_date`, `final_date`, `runoff_date`) VALUES ",
    update: "UPDATE " + functions.dbName() + ".`elections` SET <> WHERE election_id = ",
    delete: "DELETE FROM " + functions.dbName() + ".`elections` WHERE election_id = "
};

router.get('/', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }
    var connection = functions.dbConnect(res);

    connection.query(queries.all, functions.defaultJSONCallback(res));

    connection.end();
});

router.post('/create', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res);

    var data = req.body;

    if (!data) { res.status(204); return; }

    var query = queries.create + functions.constructSQLArray([
            data.election_name, data.primary_date, data.final_date, data.runoff_date
        ]);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "ELECTION_CREATE", "Entitled " + data.election_name +
        ", P | F | R: " + data.primary_date + " | " + data.final_date + " | " + data.runoff_date);

    connection.end();
});

router.put('/update/:election_id', function (req, res) {
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

    var query = queries.update.replace(/<>/g, assignments) + election_id;

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "ELECTION_MODIFY", "Modified " + election_id + ", named " + data.election_name +
        ", P | F | R: " + data.primary_date + " | " + data.final_date + " | " + data.runoff_date);

    connection.end();
});

router.delete('/delete/:election_id', function (req, res) {
    try {
        if (!functions.verifyPermissions(req).admin) {
            res.sendStatus(401);
            return;
        }

        var connection = functions.dbConnect(res),
            election_id = req.params.election_id;

        var query = queries.delete + election_id;

        connection.query(query, functions.defaultJSONCallback(res));

        logger.write(connection, req.session.cas_user, "ELECTION_DELETE", "Deleted " + election_id);

        connection.end();
    } catch (e) {
        console.error(e);
    }
});

module.exports = router;
