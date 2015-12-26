var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js');

var queries = {
    all: "SELECT * FROM `parties`",
    withLeader: "SELECT P.*, O.rcs_id, O.position FROM `parties` P LEFT JOIN `party_officers` O ON P.party_id = " +
    "O.party_id AND O.is_highest = 1"
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

module.exports = router;