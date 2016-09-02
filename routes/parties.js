var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    all: "SELECT * FROM `parties`",
    election: " WHERE election_id = ",
    activeElection: "(SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')",
    withLeader: "SELECT P.*, O.rcs_id, O.position FROM `parties` P LEFT JOIN `party_officers` O ON P.party_id = " +
    "O.party_id AND O.is_highest = 1",
    officers: "SELECT * FROM `party_officers`",
    post: "INSERT INTO " + functions.dbName() + ".`parties` (`name`, `platform`, `election_id`) VALUES ",
    update: "UPDATE parties SET <> WHERE party_id = ",
    remove: "DELETE FROM " + functions.dbName() + ".`parties` WHERE party_id = ",
    newOfficer: "INSERT INTO " + functions.dbName() + ".`party_officers` (`party_id`, `rcs_id`, `position`, `is_highest`, `first_name`, " +
    "`preferred_name`, `middle_name`, `last_name`) VALUES ",
    demoteLeader: "UPDATE " + functions.dbName() + ".`party_officers` SET `is_highest` = 0, `position` = 'Officer' WHERE `party_id` = ",
    promoteOfficer: "UPDATE " + functions.dbName() + ".`party_officers` SET `is_highest` = 1, `position` = 'Leader' WHERE `party_id` = ",
    removeOfficer: "DELETE FROM " + functions.dbName() + ".`party_officers`",
    affiliateCandidate: "UPDATE " + functions.dbName() + ".`candidates` SET `party_id` = <> WHERE rcs_id = "
};

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.all + queries.election + queries.activeElection, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/officers', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.all + queries.election + queries.activeElection, function (err, parties) {
        if (err) {
            console.log(err);
            res.status(500);
        }

        connection.query(queries.officers, function (err, officers) {
            if (err) {
                console.log(err);
                res.status(500);
            }

            for(var i = 0; i < officers.length; i++) {
                for(var j = 0; j < parties.length; j++) {
                    if(parties[j].party_id === officers[i].party_id) {
                        if(!parties[j].officers) parties[j].officers = [];
                        parties[j].officers.push(officers[i]);
                    }
                }
            }

            res.json(parties);

            connection.end();
        });
    });
});

router.post('/create', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res);

    var data = req.body;

    if (!data) { res.status(204); return; }

    var query = queries.post + functions.constructSQLArray([data.name, data.platform, data.election_id]);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "PARTY_CREATE", "Entitled " + data.name +
        ", platform: " + (data.platform.length === 100 ? data.platform.substr(0,100) + '...' : data.platform) +
        " for election with id " + data.election_id);

    connection.end();
});

router.put('/update/:party_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res),
        party_id = req.params.party_id;

    var data = req.body;

    if (!data) { res.status(204); return; }

    var assignments = "`name` = " + mysql.escape(data.name) + ", " +
        "`platform` = " + mysql.escape(data.platform) +
        "`election_id` = " + mysql.escape(data.election_id);

    var query = queries.update.replace(/<>/g, assignments) + mysql.escape(party_id);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "PARTY_MODIFY", "Modified " + party_id + ", named " + data.name);

    connection.end();
});

router.post('/addofficer/:party_id/:rcs_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var party_id = req.params.party_id,
        rcs_id = req.params.rcs_id;

    if(isNaN(parseInt(party_id))) { res.status(204); return; }

    functions.determineCMSPromise(rcs_id).then(function (response) {
        try {
            console.log("HERE");
            var cms_data = JSON.parse(response),
                connection = functions.dbConnect(res);

            var values = functions.constructSQLArray([
                party_id, cms_data.username, "Officer", 0, cms_data.first_name, cms_data.preferred_name,
                cms_data.middle_name, cms_data.last_name
            ]);

            var query = queries.newOfficer + values + " ON DUPLICATE KEY UPDATE " +
                "`rcs_id` = " + mysql.escape(cms_data.username) + " AND `party_id` = " + party_id;

            connection.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500);
                }

                query = queries.affiliateCandidate.replace(/<>/g, party_id) + mysql.escape(cms_data.username);
                connection.query(query, functions.defaultJSONCallback(res));

                logger.write(connection, req.session.cas_user, "OFFICER_ADD", "Added " + cms_data.username +
                    " as a party officer for party #" + party_id);

                connection.end();
            });
        } catch (e) {
            console.log("Invalid RCS entered (" + rcs_id + "). The client was notified.");

            logger.write(null, req.session.cas_user, "CMS_INVALID", "RCS or RIN attempted: " + req.params.rcs_id);

            res.status(400);
        }
    }, function() {
        res.status(400);
    });
});

router.delete('/removeofficer/:party_id/:rcs_id', function (req, res) {
    if(!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res),
        party_id = req.params.party_id,
        rcs_id = req.params.rcs_id;

    if(isNaN(parseInt(party_id))) { res.status(204); return; }

    var query = queries.removeOfficer + " WHERE party_id = " + party_id + " AND rcs_id = " + mysql.escape(rcs_id);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "OFFICER_REMOVE", "Removed " + rcs_id +
        " as a party officer for party #" + party_id);

    connection.end();
});


router.put('/setleader/:party_id/:rcs_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var party_id = req.params.party_id,
        rcs_id = req.params.rcs_id;

    if(isNaN(parseInt(party_id))) { res.status(204); return; }

    var connection = functions.dbConnect(res);

    connection.query(queries.demoteLeader + party_id, function (err) {
        if (err) console.log(err);

        var values = functions.constructSQLArray([
            party_id, rcs_id, "Leader", 1
        ]);

        var query = queries.promoteOfficer + party_id + " AND `rcs_id` = " + mysql.escape(rcs_id);

        connection.query(query, functions.defaultJSONCallback(res));

        logger.write(connection, req.session.cas_user, "LEADER_CREATE", "Set " + rcs_id +
            " as the party leader for party #" + party_id);

        connection.end();
    });
});

router.delete('/delete/:party_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.status(401);
    }

    var connection = functions.dbConnect(res),
        party_id = req.params.party_id;

    var query = queries.remove + mysql.escape(party_id);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "PARTY_DELETE", "Deleted " + party_id);

    connection.end();
});

module.exports = router;
