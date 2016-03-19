var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

var queries = {
    listAll: "SELECT slug FROM rpielections.pages",
    get: "SELECT title, slug, content FROM rpielections.pages WHERE slug = ",
    update: "UPDATE rpielections.pages SET <> WHERE slug = "
};

router.get('/listallpages', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.listAll, functions.defaultJSONCallback(res));

    connection.end();
});

router.get('/:page', function (req, res) {
    var connection = functions.dbConnect(res);

    connection.query(queries.get + mysql.escape(req.params.page), functions.defaultJSONCallback(res));

    connection.end();
});

router.put('/:page', function (req, res) {
    if (!functions.verifyPermissions(req).admin) {
        res.sendStatus(401);
        return;
    }

    var connection = functions.dbConnect(res);

    var slug = req.params.page,
        data = req.body;

    if(!slug || !data) {
        res.sendStatus(400);
        return;
    }

    var updateVals = "title = " + mysql.escape(data.title) +
                   ", content = " + mysql.escape(data.content);

    var query = queries.update.replace('<>', updateVals) + mysql.escape(req.params.page);

    connection.query(query, functions.defaultJSONCallback(res));

    connection.end();
});

module.exports = router;
