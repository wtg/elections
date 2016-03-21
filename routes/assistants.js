var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    all: "SELECT * FROM `assistants`",
    candidateRCS: " WHERE candidate_rcs_id = ",
    post: "INSERT INTO " + functions.dbName() + ".`assistants` (`rcs_id`, `candidate_rcs_id`, `first_name`, " +
    "`middle_name`, `last_name`,  `preferred_name`, `rin`) VALUES ",
    remove: "DELETE FROM " + functions.dbName() + ".`assistants`"
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

router.post('/create/:candidate_rcs/:assistant_rcs', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res),
        candidate_rcs = req.params.candidate_rcs,
        assistant_rcs = req.params.assistant_rcs;

    if(!candidate_rcs || !assistant_rcs) {
        res.status(400).send("Vital parameter omitted.");
        return;
    }

    var promise;
    if (isNaN(parseInt(assistant_rcs))) {
        promise = cms.getRCS(assistant_rcs);
    } else {
        promise = cms.getRIN(assistant_rcs);
    }

    connection.query("SELECT * FROM candidates WHERE rcs_id = " + mysql.escape(candidate_rcs), function (err, offices) {
        if(offices.length === 0) {
            res.status(400).send('Invalid Candidate RCS ID');
            return;
        }

        promise.then(function (response) {
            var cms_data;
            try {
                cms_data = JSON.parse(response);

                if(!cms_data.entry_date) {
                    console.log("Non-student account attempted (" + cms_data.username + "). The client was notified.");

                    logger.write(null, req.session.cas_user, "CMS_INVALID", "Non-student RCS: " + cms_data.username);

                    res.status(400).send("Non-student account attempted");
                    return;
                }

                var query = queries.post + functions.constructSQLArray([
                        cms_data.username, candidate_rcs, cms_data.first_name, cms_data.middle_name, cms_data.last_name,
                        cms_data.preferred_name, cms_data.student_id
                    ]);

                connection.query(query, functions.defaultJSONCallback(res));

                logger.write(connection, req.session.cas_user, "ASSISTANT_CREATE", "Added " + cms_data.username +
                    " as an assistant for " + candidate_rcs);

                connection.end();
            } catch (e) {
                console.log("Invalid RCS entered (" + rcs_id + "). The client was notified.");

                logger.write(null, req.session.cas_user, "CMS_INVALID", "RCS or RIN attempted: " + assistant_rcs);

                res.status(400);
            }
        }, function () {
            res.status(400);
        });
    });
});



router.delete('/delete/:candidate_rcs/:assistant_rcs', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res),
        candidate_rcs = req.params.candidate_rcs,
        assistant_rcs = req.params.assistant_rcs;

    var query = queries.remove + " WHERE rcs_id = " + mysql.escape(assistant_rcs) + " AND candidate_rcs_id = " + mysql.escape(candidate_rcs);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "ASSISTANT_DELETE", "Removed " + assistant_rcs +
        " as an assistant from " + candidate_rcs);

    connection.end();
});

module.exports = router;