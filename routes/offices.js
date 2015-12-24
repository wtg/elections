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
    var connection = dbConnect(res);

    connection.query("SELECT * FROM `offices`", function(err, result) {
        if(err) {
            console.error(err);
            res.status(500);
        }

        res.json(result);
    });

    connection.end();
});

router.get('/election/:election_id', function (req, res) {
    var connection = dbConnect(res);

    var election_id = req.params.election_id;

    connection.query("SELECT * FROM `offices` WHERE election_id = " + mysql.escape(election_id), function(err, result) {
        if(err) {
            console.error(err);
            res.status(500);
        }

        res.json(result);
    });

    connection.end();
});

router.get('/types', function (req, res) {
    var connection = dbConnect(res);

    connection.query("SELECT DISTINCT type FROM `offices` WHERE NOT type = 'all'", function(err, result) {
        if(err) {
            console.error(err);
            res.status(500);
        }

        res.json(result);
    });

    connection.end();
});

module.exports = router;