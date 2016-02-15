var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js'),
    Q = require('q');

var queries = {
    allCounts: "SELECT rcs_id,COUNT(*) as nominations FROM `rpielections`.`nominations` GROUP BY rcs_id ORDER BY nominations DESC",
    rcs: "SELECT * FROM `rpielections`.`nominations` WHERE rcs_id = ",
    rcsCounts: "SELECT rcs_id,COUNT(*) as nominations FROM `rpielections`.`nominations` WHERE rcs_id = % GROUP BY rcs_id ORDER BY nominations DESC",
    selectCandidate: "SELECT * FROM `rpielections`.`candidates` WHERE rcs_id = "
};

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.allCounts, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/:rcs_id', function (req, res) {
    var connection = functions.dbConnect(res),
        rcs_id = req.params.rcs_id;

    connection.query(queries.rcsCounts.replace(/%/g, mysql.escape(rcs_id)), functions.defaultJSONCallback(res));

    connection.end();
});

router.post('/:office_id/:rcs_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res),
        office_id = req.params.office_id,
        rcs_id = req.params.rcs_id,
        data = req.body;

    if (!data || !rcs_id || isNaN(parseInt(office_id))) {
        res.sendStatus(400);
        return;
    }

    connection.query(queries.selectCandidate + mysql.escape(rcs_id) + " AND office_id = " + office_id, function (err1, candidate_result) {
        if(candidate_result.length === 0) {
            res.sendStatus(404);
            return;
        }

        connection.query(queries.rcs + mysql.escape(rcs_id) + " AND office_id = " + office_id, function (err1, existing_rins) {
            if (err1) {
                console.log(err1);
                res.sendStatus(500);
                return;
            }

            cms.getRCS(rcs_id).then(function(candidate_cms) {
                try {
                    candidate_cms = JSON.parse(candidate_cms);
                } catch(e) {
                    res.sendStatus(404);
                    return;
                }

                var promises = [];
                var nomination_ids = [];

                for(var x=0; x<data.length; x++) {
                    if(data[x].rin != '' && data[x].initials != '') {
                        promises.push(cms.getRIN(data[x].rin));
                        nomination_ids.push(x);
                    }
                }

                Q.all(promises).then(function(responses) {
                    for(var x=0; x<responses.length; x++) {
                        var nomination_cms;
                        try {
                            nomination_cms = JSON.parse(responses[x]);
                        } catch(e) {
                            data[nomination_ids[x]].status = "invalid";
                            continue;
                        }

                        data[nomination_ids[x]].candidate_cms = candidate_cms;
                        data[nomination_ids[x]].nomination_cms = nomination_cms;

                        if(existing_rins.indexOf(data[nomination_ids[x]].rin) != -1) {
                            data[nomination_ids[x]].status = "already";
                        } else if(nomination_cms.class_by_credit === candidate_cms.class_by_credit || nomination_cms.entry_date === candidate_cms.entry_date) {
                            if((nomination_cms.first_name[0] + nomination_cms.last_name[0]) == data[nomination_ids[x]].initials) {
                                data[nomination_ids[x]].status = "success";
                                existing_rins.push(data[nomination_ids[x]].rin);
                            } else {
                                data[nomination_ids[x]].status = "initials";
                            }
                        } else if(nomination_cms.class_by_credit != candidate_cms.class_by_credit && nomination_cms.entry_date != candidate_cms.entry_date) {
                            data[nomination_ids[x]].status = "wrongclass";
                        } else {
                            data[nomination_ids[x]].status = "invalid";
                        }
                    }
                }, function(responses) {
                    console.log(responses);
                }).finally(function () {
                    res.json(data);

                    connection.end();
                });
            });
        });
    });
});

module.exports = router;