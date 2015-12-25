var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js');

var queries = {
    allNoData: "SELECT * FROM `candidates`",
    allWithData: "SELECT C.*, D.preferred_name, D.first_name, D.middle_name, D.last_name, D.greek_affiliated," +
    " D.entry_date, D.class_by_credit, D.grad_date, D.rin, D.major, D.about, D.platform, D.video_url " +
    "FROM `candidates` C LEFT JOIN `candidate_data` D ON C.rcs_id = D.rcs_id",
    active_election: "(SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')",

    rcs: " WHERE C.rcs_id = ",
    office: " WHERE C.office_id = ",

    post: "INSERT INTO `rpielections`.`candidates` (`rcs_id`, `office_id`, `election_id`) VALUES ",
    postCMSData: "INSERT INTO `rpielections`.`candidate_data` (`rcs_id`, `preferred_name`, `first_name`, " +
    "`middle_name`, `last_name`, `greek_affiliated`, `entry_date`, `class_by_credit`, `grad_date`, `rin`) VALUES ",
    remove: "DELETE FROM `rpielections`.`candidates` ",

    duplicateRCS: " ON DUPLICATE KEY UPDATE rcs_id = "
};

var useData = function (req) {
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

router.post('/create/:rcs_id/:office_id', function (req, res) {
    var connection = functions.dbConnect(res);

    var rcs_id = req.params.rcs_id,
        office_id = req.params.office_id;

    var promise;
    if (isNaN(parseInt(rcs_id))) {
        console.log("RCS ID, NOT RIN");
        promise = cms.getRCS(rcs_id);
    } else {
        promise = cms.getRIN(rcs_id);
    }

    promise.then(function (response) {
        if (response.substr(0, 4) !== "<html>") {
            var cms_data = JSON.parse(response);

            var values = functions.constructSQLArray([
                cms_data.username, cms_data.preferred_name, cms_data.first_name, cms_data.middle_name,
                cms_data.last_name, (cms_data.greek_affiliated ? 1 : 0), cms_data.entry_date, cms_data.class_by_credit,
                cms_data.grad_date, cms_data.student_id
            ]);

            var query = queries.postCMSData + values + queries.duplicateRCS +
                mysql.escape(cms_data.username);

            connection.query(query, function (err) {
                if (err) throw err;
            });

            values = functions.constructSQLArray([cms_data.username, office_id]);

            query = queries.post + values.substr(0, values.length - 1) + ", " + queries.active_election + ")" +
                    queries.duplicateRCS + mysql.escape(cms_data.username) + ", office_id = " + office_id;
            console.log(query);

            connection.query(query, functions.defaultJSONCallback(res));
        } else {
            console.log("Invalid RCS entered (" + rcs_id + "). The client was notified.");
            res.status(301);
        }
        connection.end();
    });
});

router.delete('/delete/:rcs_id/:office_id', function(req, res) {
    var connection = functions.dbConnect(res);

    var rcs_id = req.params.rcs_id,
        office_id = req.params.office_id;

    var query = queries.remove + " WHERE rcs_id = " + mysql.escape(rcs_id) + " AND office_id = " + mysql.escape(office_id);

    connection.query(query, functions.defaultJSONCallback(res));
});

module.exports = router;