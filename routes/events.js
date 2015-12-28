var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js');

var queries = {
    all: "SELECT * FROM `events` ORDER BY date, start, end"
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

    connection.query(queries.all + " LIMIT " + quantity, functions.defaultJSONCallback(res));

    connection.end();
});

module.exports = router;