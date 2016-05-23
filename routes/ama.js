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

function handleAnonymity(result) {
    result.forEach(function (elem) {
        elem.rcs_id = elem.is_anonymous ? "Anonymous" : elem.rcs_id;
    });

    return result;
};

functions.massProduceRoutes(router, [
    {
        method: 'get',
        path: '/',
        queryFunc: function (req, dbName) {
            return "SELECT * FROM " + dbName + "`ama_questions`";
        },
        successResultFunc: handleAnonymity
    },
    {
        method: 'get',
        path: '/candidate/:rcs_id',
        queryFunc: function (req, dbName) {
            var rcs_id = mysql.escape(req.params.rcs_id);
            return queries.all + queries.rcs + rcs_id
        },
        successResultFunc: handleAnonymity
    },
    {
        method: 'post',
        path: '/candidate/:rcs_id',
        needsAdmin: true,
        queryFunc: function (req, dbName) {
            var data = req.body,
                candidate_rcs_id = req.params.rcs_id;

            var values = functions.constructSQLArray([
                candidate_rcs_id, req.session.cas_user.toLowerCase(), data.question_text,
                data.is_anonymous
            ]);

            return queries.post + values.substr(0, values.length - 1) + ", " + queries.activeElection + ")";
        }
    },
    {
        method: 'put',
        path: '/candidate/:rcs_id',
        authorizedFunc: function (req) {
            var permissions = !functions.verifyPermissions(req);
            return (permissions.authenticated ||
                req.session.cas_user.toLowerCase() !== req.params.rcs_id) &&
                permissions.admin;
        },
        queryFunc: function (req, dbName) {
            var data = req.body;
            var candidate_rcs_id = req.params.rcs_id;
            return queries.update + mysql.escape(data.answer_text) + " WHERE question_id = " + mysql.escape(data.question_id);
        }
    }
]);

module.exports = router;
