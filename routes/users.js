var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    Q = require('q');


module.exports = router;

router.get('/', function(req, res) {
    if (!req.session || !req.session.cas_user || !req.session.is_authenticated) {
        res.json({
            authenticated: false,
            username: null,
            admin: false
        });
    } else {
        res.json({
            authenticated: req.session.is_authenticated,
            username: req.session.cas_user.toLowerCase(),
            admin: req.session.admin_rights
        });
    }
});

