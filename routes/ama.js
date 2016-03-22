var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    all: "SELECT * FROM `ama_questions`",
    rcs: " WHERE candidate_rcs_id = ",
    post: "INSERT INTO `ama_questions` (`candidate_rcs_id`, `rcs_id`, " +
        "`question_text`, `is_anonymous`, `election_id`) VALUES ",
    activeElection: "(SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')",
    update: "UPDATE ama_questions SET answer_text = "
};

var handleAnonymity = function (result) {
    result.forEach(function (elem) {
        elem.rcs_id = elem.is_anonymous ? "Anonymous" : elem.rcs_id;
    });

    return result;
};

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

router.post('/candidate/:rcs_id', function (req, res) {
    if (!functions.verifyPermissions(req).authenticated) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res),
        data = req.body,
        candidate_rcs_id = req.params.rcs_id;

    if (!data) {
        res.sendStatus(204);
        return;
    }

    var values = functions.constructSQLArray([
        candidate_rcs_id, req.session.cas_user.toLowerCase(), data.question_text,
        data.is_anonymous
    ]);

    var query = queries.post + values.substr(0, values.length - 1) + ", " + queries.activeElection + ")";

    connection.query(query, functions.defaultJSONCallback(res));

    connection.end();
});

router.put('/candidate/:rcs_id', function (req, res) {
    if (!functions.verifyPermissions(req).authenticated ||
        req.session.cas_user.toLowerCase() !== req.params.rcs_id) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res),
        data = req.body,
        candidate_rcs_id = req.params.rcs_id;

    if (!data) {
        res.sendStatus(204);
        return;
    }

    var query = queries.update + mysql.escape(data.answer_text) + " WHERE question_id = " + mysql.escape(data.question_id);

    connection.query(query, functions.defaultJSONCallback(res));

    connection.end();
});

module.exports = router;
