var router = require('express').Router();
var mysql = require('mysql');
var functions = require('../functions.js');
var cms = require('../cms.js');

var queries = {
    post: "INSERT INTO " + functions.dbName() + ".`assistants` (`rcs_id`, `candidate_rcs_id`, `first_name`, " +
    "`middle_name`, `last_name`,  `preferred_name`, `rin`) VALUES "
};

functions.massProduceRoutes(router, [
    {
        method: 'get',
        path: '/',
        queryFunc: function (req, dbName) {
            return "SELECT * FROM " + dbName + ".`assistants`"
        }
    },
    {
        method: 'get',
        path: '/candidate/:candidate_rcs',
        queryFunc: function (req, dbName) {
            var rcs = mysql.escape(req.params.candidate_rcs);
            return "SELECT * FROM " + dbName + ".`assistants` WHERE candidate_rcs_id = " + rcs;
        }
    },
    {
        method: 'delete',
        path: '/delete/:candidate_rcs/:assistant_rcs',
        needsAdmin: true,
        logType: 'ASSISTANT_DELETE',
        queryFunc: function (req, dbName) {
            var candidate = mysql.escape(req.params.candidate_rcs),
                assistant = mysql.escape(req.params.assistant_rcs);

            return "DELETE FROM " + dbName + ".`assistants`" + " WHERE rcs_id = " + assistant + " AND candidate_rcs_id = " + candidate;
        }
    }
]);

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

module.exports = router;
