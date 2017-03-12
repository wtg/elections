var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    all: "SELECT *, quantity * item_price as `total_price` FROM `expenses`",
    candidateRCS: " WHERE rcs_id = ",
    remove: "DELETE FROM " + functions.dbName() + ".`expenses` WHERE expense_id = "
};

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.all, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/candidate/:candidate_rcs', function (req, res) {
    var connection = functions.dbConnect(res),
        candidate_rcs = req.params.candidate_rcs;

    connection.query(queries.all + queries.candidateRCS + mysql.escape(candidate_rcs), functions.defaultJSONCallback(res));

    connection.end();
});

router.delete('/delete/:expense_id', function (req, res) {
    var connection = functions.dbConnect(res),
        expense_id = req.params.expense_id;

    connection.query(queries.all + ' WHERE expense_id = ' + mysql.escape(expense_id), function (err, result) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }

        if(result.length == 0) {
            res.sendStatus(404);
            return;
        }

        var userData = functions.verifyPermissions(req);
        if (!userData.admin && userData.username != result[0].rcs_id) {
            res.sendStatus(401);
            return;
        }

        var query = queries.remove + expense_id;

        connection.query(query, functions.defaultJSONCallback(res));

        logger.write(connection, req.session.cas_user, "EXPENSE_DELETE", "Deleted " + expense_id);

        connection.end();
    });
});

module.exports = router;
