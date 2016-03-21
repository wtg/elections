var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js'),
    Q = require('q');

var queries = {
    allCounts: "SELECT rcs_id, office_id, COUNT(*) as nominations FROM " + functions.dbName() + ".`nominations` GROUP BY rcs_id, office_id ORDER BY nominations DESC",
    rcs: "SELECT nomination_rin FROM " + functions.dbName() + ".`nominations` WHERE rcs_id = ",
    rcsCounts: "SELECT rcs_id, office_id, COUNT(*) as nominations FROM " + functions.dbName() + ".`nominations` WHERE rcs_id = % GROUP BY rcs_id, office_id ORDER BY nominations DESC",
    selectCandidate: "SELECT * FROM " + functions.dbName() + ".`candidates` WHERE rcs_id = ",
    selectOfficeType: "SELECT type FROM " + functions.dbName() + ".`offices` WHERE office_id = ",
    activeElection: "(SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')",
    post: "INSERT INTO " + functions.dbName() + ".`nominations` (`rcs_id`, `office_id`, `nomination_rin`, `election_id`) VALUES "
};

var verifyCohort = function (candidate, nomination, type) {
    return !type || type.toLowerCase() === 'all' ||
        (type.toLowerCase() === 'greek' && nomination.greek_affiliated) ||
        (type.toLowerCase() === 'independent' && !nomination.greek_affiliated) ||
        (parseInt(type) === new Date().getFullYear() && nomination.class_by_credit === 'Graduate') ||
        nomination.class_by_credit === candidate.class_by_credit ||
        nomination.entry_date === candidate.entry_date;
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

    connection.query(queries.selectOfficeType + mysql.escape(office_id), function (err0, office_type) {
        if(err0) {
            console.log(err1);
            res.sendStatus(500);
            return;
        }

        var type = office_type[0].type;

        connection.query(queries.selectCandidate + mysql.escape(rcs_id) + " AND office_id = " + office_id, function (err1, candidate_result) {
            if (err1) {
                console.log(err1);
                res.sendStatus(500);
                return;
            }

            if (candidate_result.length === 0) {
                res.sendStatus(404);
                return;
            }

            connection.query(queries.rcs + mysql.escape(rcs_id) + " AND office_id = " + office_id, function (err2, previous_nominations) {
                if (err2) {
                    console.log(err2);
                    res.sendStatus(500);
                    return;
                }

                var existing_rins = [];
                for (var i = 0; i < previous_nominations.length; i++) {
                    existing_rins.push(previous_nominations[i].nomination_rin);
                }

                cms.getRCS(rcs_id).then(function (candidate_cms) {
                    try {
                        candidate_cms = JSON.parse(candidate_cms);
                    } catch (e) {
                        res.sendStatus(404);
                        return;
                    }

                    var promises = [];
                    var nomination_ids = [];

                    for (var x = 0; x < data.length; x++) {
                        if (data[x].rin != '' && data[x].initials != '') {
                            promises.push(cms.getRIN(data[x].rin));
                            nomination_ids.push(x);
                        }
                    }

                    Q.all(promises).then(function (responses) {
                        for (var x = 0; x < responses.length; x++) {
                            var nomination_cms;
                            try {
                                nomination_cms = JSON.parse(responses[x]);
                            } catch (e) {
                                data[nomination_ids[x]].status = "invalid";
                                continue;
                            }

                            if (existing_rins.indexOf(data[nomination_ids[x]].rin) != -1) {
                                data[nomination_ids[x]].status = "already";
                            } else if (verifyCohort(candidate_cms, nomination_cms, type)) {
                                if ((nomination_cms.first_name[0] + nomination_cms.last_name[0]) == data[nomination_ids[x]].initials) {
                                    data[nomination_ids[x]].status = "success";
                                    existing_rins.push(data[nomination_ids[x]].rin);
                                } else {
                                    data[nomination_ids[x]].status = "initials";
                                }
                            } else if (!verifyCohort(candidate_cms, nomination_cms, type)) {
                                data[nomination_ids[x]].status = "wrongclass";
                            } else {
                                data[nomination_ids[x]].status = "invalid";
                            }
                        }
                    }, function (responses) {
                        console.log(responses);
                    }).finally(function () {
                        var values = "";
                        var count = 0;
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].status === "success") {
                                values += functions.constructSQLArray([rcs_id, office_id, data[i].rin]);
                                values = values.substr(0, values.length - 1) + ", " + queries.activeElection + "), ";
                                count++;
                            }
                        }

                        if (count > 0) {
                            connection.query(queries.post + values.substr(0, values.length - 2), function (err3) {
                                if (err3) {
                                    console.log(err3);
                                    res.sendStatus(500);
                                    return;
                                }

                                res.json(data);
                                connection.end();
                            });
                        } else {
                            res.json(data);
                            connection.end();
                        }
                    });
                });
            });
        });
    });
});

module.exports = router;