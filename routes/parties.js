var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    all: "SELECT * FROM `parties`",
    withLeader: "SELECT P.*, O.rcs_id, O.position FROM `parties` P LEFT JOIN `party_officers` O ON P.party_id = " +
    "O.party_id AND O.is_highest = 1",
    post: "INSERT INTO `rpielections`.`parties` (`name`, `platform`) VALUES ",
    update: "UPDATE parties SET <> WHERE party_id = ",
    remove: "DELETE FROM `rpielections`.`parties` WHERE party_id = "
};

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.all, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/withleader', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.withLeader, functions.defaultJSONCallback(res));

    connection.end();
});

router.post('/create', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res);

    var data = req.body;

    if (!data) res.status(204);

    var query = queries.post + functions.constructSQLArray([data.name, data.platform]);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "PARTY_CREATE", "Entitled " + data.name +
        ", platform: " + (data.platform.length === 100 ? data.platform.substr(0,100) + '...' : data.platform));

    connection.end();
});

router.put('/update/:party_id', function (req, res) {
    try {
        if (!functions.verifyPermissions(req).admin) {
            res.status(401);
        }

        var connection = functions.dbConnect(res),
            party_id = req.params.party_id;

        var data = req.body;

        if (!data) res.status(204);

        var assignments = "`name` = " + mysql.escape(data.name) + ", " +
            "`platform` = " + mysql.escape(data.platform);

        var query = queries.update.replace(/<>/g, assignments) + mysql.escape(party_id);

        connection.query(query, functions.defaultJSONCallback(res));

        logger.write(connection, req.session.cas_user, "PARTY_MODIFY", "Modified " + party_id + ", named " + data.name);

        connection.end();
    } catch(e) { console.log(e); }
});

router.delete('/delete/:party_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res),
        party_id = req.params.party_id;

    var query = queries.remove + mysql.escape(party_id);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "PARTY_DELETE", "Deleted " + party_id);

    connection.end();
});

module.exports = router;