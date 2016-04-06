var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    all: "SELECT * FROM " + functions.dbName() + ".`events` ORDER BY date, start, end",
    future: "SELECT * FROM `events` WHERE date >= CURDATE() ORDER BY date, start, end LIMIT ",
    post: "INSERT INTO " + functions.dbName() + ".`events` (`title`, `location`, `date`, `start`, `end`, `description`) VALUES ",
    update: "UPDATE " + functions.dbName() + ".`events` SET <> WHERE event_id = ",
    remove: "DELETE FROM " + functions.dbName() + ".`events` WHERE event_id = "
};

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.all, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/limit/:quantity', function (req, res) {
    var connection = functions.dbConnect(res);

    var quantity = parseInt(req.params.quantity);

    if(isNaN(quantity)) {
        res.status(400);
    }

    connection.query(queries.future + mysql.escape(quantity), functions.defaultJSONCallback(res));

    connection.end();
});

router.post('/create', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res);

    var data = req.body;

    if (!data) { res.status(204); return; }

    var query = queries.post + functions.constructSQLArray([
            data.title, data.location, data.date, data.start, data.end, data.description
        ]);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "EVENT_CREATE", "Entitled " + data.title +
        ", description: " + (data.description.length >= 100 ? data.description.substr(0,100) + '...' : data.description));

    connection.end();
});

router.put('/update/:event_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res),
        event_id = req.params.event_id;

    var data = req.body;

    if (!data) {
        res.sendStatus(204);
        return;
    }

    var assignments = "`title` = " + mysql.escape(data.title) + ", `location` = " + mysql.escape(data.location) +
        ", `date` = " + mysql.escape(data.date) + ", `start` = " + mysql.escape(data.start) +
        ", `end` = " + mysql.escape(data.end) + ", `description` = " + mysql.escape(data.description);

    var query = queries.update.replace(/<>/g, assignments) + event_id;

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "EVENT_MODIFY", "Modified " + event_id + ", named " + data.name);

    connection.end();
});

router.delete('/delete/:event_id', function (req, res) {
    try {
        if (!functions.verifyPermissions(req).admin) {
            res.sendStatus(401);
            return;
        }

        var connection = functions.dbConnect(res),
            event_id = req.params.event_id;

        var query = queries.remove + event_id;

        connection.query(query, functions.defaultJSONCallback(res));

        logger.write(connection, req.session.cas_user, "EVENT_DELETE", "Deleted " + event_id);

        connection.end();
    } catch (e) {
        console.error(e);
    }
});

module.exports = router;
