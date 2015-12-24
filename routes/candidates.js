var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    db = require('../db.js');

var dbConnect = function(res) {
    var connection = mysql.createConnection(db);
    connection.connect();
    connection.query("USE `rpielections`;", function(err) {
        if(err) {
            console.error(err);
            res.status(500);
        }
    });
    return connection;
};

router.get('/', function (req, res) {
    var includeData = (req.body.includeData !== undefined ? req.body.includeData : true);

    var connection = dbConnect(res);

    if(!includeData) {
        connection.query("SELECT * FROM `candidates`", function (err, result) {
            if (err) {
                console.error(err);
                res.status(500);
            }

            res.json(result);
        });
    } else {
        connection.query("SELECT * FROM `candidates` C LEFT JOIN `candidate_data` D ON C.rcs_id = D.rcs_id " +
            "UNION SELECT * FROM `candidates` C RIGHT JOIN `candidate_data` D ON C.rcs_id = D.rcs_id;", function (err, result) {
            if (err) {
                console.error(err);
                res.status(500);
            }

            res.json(result);
        });
    }

    connection.end();
});

router.get('/office/:office_id', function (req, res) {
    var connection = dbConnect(res);

    var office_id = req.params.office_id;

    connection.query("SELECT * FROM `candidates` WHERE office_id = " + mysql.escape(office_id), function (err, result) {
        if (err) {
            console.error(err);
            res.status(500);
        }

        res.json(result);
    });

    connection.end();
});

module.exports = router;