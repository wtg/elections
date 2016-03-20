var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    all: "SELECT * FROM `ama_questions`",
    rcs: " WHERE candidate_rcs_id = "
};

var handleAnonymity = function (result) {
    result.forEach(function (elem) {
        elem.rcs_id = elem.is_anonymous ? "Anonymous" : elem.rcs_id;
    });

    return result;
};

router.get('/candidate/:rcs_id', function (req, res) {
    var connection = functions.dbConnect(res),
        rcs_id = req.params.rcs_id;

    if(!rcs_id) {
        res.sendStatus(400);
        return;
    }

    connection.query(queries.all + queries.rcs + mysql.escape(rcs_id), function (err, result) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }

        result = handleAnonymity(result);

        res.json(result);
    });

    connection.end();
});

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.all, function (err, result) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }

        result = handleAnonymity(result);

        res.json(result);
    });

    connection.end();
});

module.exports = router;
