var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js'),
    uid = require('uid2'),
    mime = require('mime'),
    fs = require('fs'),
    path = require('path')
    striptags = require('striptags');

var IMAGE_TYPES = ['image/jpeg', 'image/png'];
var TARGET_PATH = path.resolve(__dirname, '../public/usr_content');

var queries = {
    allNoData: "SELECT * FROM `candidates`",
    allWithData: "SELECT C.*, D.preferred_name, D.first_name, D.middle_name, D.last_name, D.greek_affiliated, " +
    "D.entry_date, D.class_by_credit, D.grad_date, D.rin, D.major, D.about, D.platform, D.video_url, D.misc_info, " +
    "D.profile_url, D.cover_url, O.name AS office_name, O.description AS office_description, O.expense_limit AS office_expense_limit, " +
    "O.openings AS office_openings, O.nominations_required AS office_nominations_required, O.type AS office_type, " +
    "O.disabled AS office_disabled " +
    "FROM `candidates` C LEFT JOIN `candidate_data` D ON C.rcs_id = D.rcs_id LEFT JOIN " +
    "`offices` O ON C.office_id = O.office_id " +
    "WHERE C.election_id = (SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')",
    allWithDataAndParty: "SELECT C.*, D.preferred_name, D.first_name, D.middle_name, D.last_name, D.greek_affiliated, " +
    "D.entry_date, D.class_by_credit, D.grad_date, D.rin, D.major, D.about, D.platform, D.video_url, D.misc_info, " +
    "D.profile_url, D.cover_url, O.name AS office_name, O.description AS office_description, O.expense_limit AS office_expense_limit, " +
    "O.openings AS office_openings, O.nominations_required AS office_nominations_required, O.type AS office_type, " +
    "O.disabled AS office_disabled, P.name AS party_name, P.platform AS party_platform " +
    "FROM `candidates` C LEFT JOIN `candidate_data` D ON C.rcs_id = D.rcs_id LEFT JOIN " +
    "`offices` O ON C.office_id = O.office_id LEFT JOIN `parties` P ON C.party_id = P.party_id " +
    "WHERE C.election_id = (SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')",
    activeElection: "(SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')",

    rcs: " AND C.rcs_id = ",
    office: " WHERE C.office_id = ",
    random: "SELECT C.*, D.preferred_name, D.first_name, D.middle_name, D.last_name, " +
    "D.greek_affiliated, D.misc_info, D.entry_date, D.class_by_credit, D.grad_date, " +
    "D.rin, D.major, D.about, D.platform, D.video_url, D.misc_info, D.profile_url, " +
    "D.cover_url FROM (SELECT O.*, R.rcs_id FROM (SELECT * FROM `candidates` WHERE election_id = " +
    "(SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id') " +
    "ORDER BY RAND() LIMIT 1) AS R INNER JOIN `offices` AS O WHERE O.office_id = " +
    "R.office_id) AS C LEFT JOIN `candidate_data` AS D ON C.rcs_id = D.rcs_id",
    random_list: "SELECT DISTINCT C.rcs_id FROM (SELECT * FROM `candidates` WHERE election_id = " +
    "(SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')) AS C " +
    "ORDER BY RAND()",

    post: "INSERT INTO " + functions.dbName() + ".`candidates` (`rcs_id`, `office_id`, `election_id`) VALUES ",
    postCMSData: "INSERT INTO " + functions.dbName() + ".`candidate_data` (`rcs_id`, `preferred_name`, `first_name`, " +
    "`middle_name`, `last_name`, `greek_affiliated`, `entry_date`, `class_by_credit`, `grad_date`, `rin`) VALUES ",
    remove: "DELETE FROM " + functions.dbName() + ".`candidates` ",
    update: "UPDATE " + functions.dbName() + ".`candidate_data` SET <> WHERE rcs_id = ",
    updateParty: "UPDATE " + functions.dbName() + ".`candidates` SET `party_id` = <> WHERE rcs_id = ",

    duplicateRCS: " ON DUPLICATE KEY UPDATE rcs_id = ",
    partiesEnabled: "SELECT `value` FROM `configurations` WHERE `key` = 'parties_enabled'",
    listRCS: "SELECT `rcs_id` FROM `candidates` WHERE election_id = (SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id');"
};

var processMiscInfo = function (result) {
    for(var r=0; r < result.length; r++) {
        if (result[r].misc_info) {
            var misc_info = result[r].misc_info.split('\n');
            result[r].misc_info = "";
            result[r].misc_info_obj = [];

            for (var i = 0; i < misc_info.length; i++) {
                var item = misc_info[i].split(':');

                if (item.length < 2) {
                    continue;
                }

                if (item[0].trim() === "Experience") {
                    result[r].experience = (item[1] ? item[1].trim() : "");
                } else if (item[0].trim() === "Activities") {
                    result[r].activities = (item[1] ? item[1].trim() : "");
                } else if (item[0].trim() === "Facebook") {
                    result[r].facebook = (item[1].trim().length > 0 ? "http://" + item[1].trim() : "");
                } else if (item[0].trim() === "Twitter") {
                    result[r].twitter = (item[1].trim().length > 0 ? "http://" + item[1].trim() : "");
                } else {
                    result[r].misc_info += misc_info[i];
                    result[r].misc_info_obj.push({
                        label: item[0].trim(),
                        entry: item[1].trim()
                    });
                }
            }
        } else {
            result[r].experience = "";
            result[r].activities = "";
            result[r].facebook = "";
            result[r].twitter = "";
            result[r].misc_info = "";
        }
    }

    return result;
};

var makeEmailsFromRCSList = function (result) {
    var string = ''
        for (var i = 0; i < result.length; i++) {
            if (i > 0 && i < result.length - 1 &&
                result[i - 1].rcs_id == result[i].rcs_id) continue;
            string += result[i].rcs_id + '@rpi.edu';
            if (i != result.length - 1) string += '\n';
        }
    return string;
}

var useDataQuery = function (req, res, callback) {
    var connection = functions.dbConnect();

    connection.query(queries.partiesEnabled, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500);
        }

        var partiesEnabled = result[0].value/1;
        var dataQuery;
        if (partiesEnabled == 1) {
            dataQuery = queries.allWithDataAndParty;
        } else {
            dataQuery = queries.allWithData;
        }

        var includeData = (req.body.includeData !== undefined ? req.body.includeData : true);
        var query = !includeData ? queries.allNoData : dataQuery;

        callback(query);
    });

    connection.end();
};

router.get('/', function (req, res) {
    var connection = functions.dbConnect(res);

    useDataQuery(req, res, function (query) {
        connection.query(query, function (err, result) {
            if (err) {
                console.log(err);
                res.status(500);
            }

            res.json(processMiscInfo(result));
        });
        connection.end();
    });
});

router.get('/random', function (req, res) {
    var connection = functions.dbConnect(res);

    // forces the client to re-pull every time the random route is called
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");

    connection.query(queries.random, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/random_list', function (req, res) {
    var connection = functions.dbConnect(res);

    // forces the client to re-pull every time the random route is called
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");

    connection.query(queries.random_list, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/rcs/:rcs_id', function (req, res) {
    var connection = functions.dbConnect(res),
        rcs_id = req.params.rcs_id;

    useDataQuery(req, res, function (query) {
        connection.query(query + queries.rcs + mysql.escape(rcs_id), function (err, result) {
            if (err) {
                console.log(err);
                res.status(500);
            }

            // add an additional field with HTML-stripped "about" text for Meet a Candidate
            result.forEach(function (elem) {
                elem.about_stripped = striptags(elem.about);
            });

            res.json(processMiscInfo(result));
        });
    });
});

router.get('/office/:office_id', function (req, res) {
    var connection = functions.dbConnect(res),
        office_id = req.params.office_id;

    useDataQuery(req, res, function (query) {
        connection.query(query + queries.office + mysql.escape(office_id), function (err, result) {
            if (err) {
                console.log(err);
                res.status(500);
            }

            res.json(processMiscInfo(result));
        });
    });

    connection.end();
});

router.post('/create/:rcs_id/:office_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }

    var rcs_id = req.params.rcs_id,
        office_id = req.params.office_id;

    var promise;
    if (isNaN(parseInt(rcs_id))) {
        promise = cms.getRCS(rcs_id);
    } else {
        promise = cms.getRIN(rcs_id);
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

            var connection = functions.dbConnect(res);

            var values = functions.constructSQLArray([
                cms_data.username, cms_data.preferred_name, cms_data.first_name, cms_data.middle_name,
                cms_data.last_name, (cms_data.greek_affiliated ? 1 : 0), cms_data.entry_date, cms_data.class_by_credit,
                cms_data.grad_date, cms_data.student_id
            ]);

            var query = queries.postCMSData + values + queries.duplicateRCS +
                mysql.escape(cms_data.username);

            connection.query(query, function (err) {
                if (err) throw err;
            });

            values = functions.constructSQLArray([cms_data.username, office_id]);

            query = queries.post + values.substr(0, values.length - 1) + ", " + queries.activeElection + ")" +
                queries.duplicateRCS + mysql.escape(cms_data.username) + ", office_id = " + office_id;

            connection.query(query, functions.defaultJSONCallback(res));

            logger.write(connection, req.session.cas_user, "CANDIDATE_CREATE", "Added " + cms_data.username +
                " as a candidate for office #" + office_id);

            connection.end();
        } catch (e) {
            console.log("Invalid RCS entered (" + rcs_id + "). The client was notified.");

            logger.write(null, req.session.cas_user, "CMS_INVALID", "RCS or RIN attempted: " + req.params.rcs_id);

            res.status(400);
        }
    }, function () {
        res.status(400);
    });
});

router.put('/update/:rcs_id', function (req, res) {
    var userData = functions.verifyPermissions(req);
    if (!userData.admin && userData.username != req.params.rcs_id) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res);

    var rcs_id = req.params.rcs_id,
        data = req.body;

    if (!data) res.status(204);

    var query = queries.updateParty.replace(/<>/g, !isNaN(parseInt(data.party_id)) ? data.party_id : "NULL") +
        mysql.escape(data.rcs_id);
    console.log(query);
    connection.query(query, function (err) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            connection.end();
            return;
        }

        var fields = [
            'preferred_name', 'first_name', 'middle_name', 'last_name', 'major', 'about', 'platform', 'video_url',
            'profile_url', 'cover_url', 'misc_info'
        ];

        var assignments = "";

        fields.forEach(function (elem, index) {
            if (data.hasOwnProperty(elem)) {
                assignments += "`" + elem + "` = " + mysql.escape(data[elem]) + (index < fields.length - 1 ? ", " : "");
            }
        });

        query = queries.update.replace(/<>/g, assignments) + mysql.escape(rcs_id);

        connection.query(query, functions.defaultJSONCallback(res));

        logger.write(connection, req.session.cas_user, "CANDIDATE_MODIFY", "Modified " + rcs_id);

        connection.end();
    });
});

router.delete('/delete/:rcs_id/:office_id', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res);

    var rcs_id = req.params.rcs_id,
        office_id = req.params.office_id;

    var query = queries.remove + " WHERE rcs_id = " + mysql.escape(rcs_id) + " AND office_id = " + mysql.escape(office_id);

    connection.query(query, functions.defaultJSONCallback(res));

    logger.write(connection, req.session.cas_user, "CANDIDATE_DELETE", "Removed " + rcs_id +
        " from office #" + office_id);

    connection.end();
});

router.get('/upload', function (req, res) {
    // Source
    //http://blog.robertonodi.me/simple-image-upload-with-express/

    // Variables
    var is, os, targetPath, targetName, tempPath = req.files.file.path;

    // Get Image
    var type = mime.lookup(req.files.file.path);
    var extension = req.files.file.path.split(/[. ]+/).pop();

    // Check Type
    if (IMAGE_TYPES.indexOf(type) == -1) {
        return res.send(415, 'Supported image formats: jpeg, jpg, jpe, png.');
    }

    // Store Image
    targetName = uid(22) + '.' + extension;
    targetPath = path.join(TARGET_PATH, targetName);

    // Read and Write Streams
    is = fs.createReadStream(tempPath);
    os = fs.createWriteStream(targetPath);
    is.pipe(os);

    // Error Handling
    is.on('error', function() {
        if (err) {
            console.log(err);
            return res.send(500, 'Something went wrong');
        }
    });

    // Clean Up
    is.on('end', function() {
        fs.unlink(tempPath, function(err) {
            if (err) {
                return res.send(500, 'Something went wrong');
            }
            res.render('image', {
                name: targetName,
                type: type,
                extension: extension
            });
        });
    });
});

router.get('/email', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.listRCS, function(err, rows, fields) {
        if (err) {
            console.log(err);
            res.status(500);
        }
        res.set('Content-Type', 'text/plain');
        res.send(makeEmailsFromRCSList(rows));
    });
});

module.exports = router;
