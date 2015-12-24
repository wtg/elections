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

    connection.query("SELECT * FROM `candidates`", function(err, result) {
        if(err) {
            console.error(err);
            res.status(500);
        }

        res.json(result);
    });

    connection.end();
});

router.get('/office/:office_id', function (req, res) {
    var connection = dbConnect(res);

    var office_id = req.params.office_id;

    connection.query("SELECT * FROM `candidates` WHERE office_id = " + mysql.escape(office_id), function(err, result) {
        if(err) {
            console.error(err);
            res.status(500);
        }

        res.json(result);
    });

    connection.end();
});

module.exports = router;