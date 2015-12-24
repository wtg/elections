var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js');

var queries = {
    allNoData: "SELECT * FROM `candidates`",
    allWithData: "SELECT C.*, D.preferred_name, D.first_name, D.middle_name, D.last_name, D.greek_affiliated," +
    " D.entry_date, D.class_by_credit, D.grad_date, D.rin, D.major, D.about, D.platform, D.video_url " +
    "FROM `candidates` C LEFT JOIN `candidate_data` D ON C.rcs_id = D.rcs_id",

    rcs: " WHERE C.rcs_id = ",
    office: " WHERE C.office_id = "
};

var useData = function(req) {
    var includeData = (req.body.includeData !== undefined ? req.body.includeData : true);
    return (!includeData ? queries.allNoData : queries.allWithData);
};

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(useData(req), functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/rcs/:rcs_id', function (req, res) {
    var connection = functions.dbConnect(res),
        rcs_id = req.params.rcs_id;

    connection.query(useData(req) + queries.rcs + mysql.escape(rcs_id), functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/office/:office_id', function (req, res) {
    var connection = functions.dbConnect(res),
        office_id = req.params.office_id;

    connection.query(useData(req) + queries.office + mysql.escape(office_id), functions.defaultJSONCallback(res));

    connection.end();
});

module.exports = router;