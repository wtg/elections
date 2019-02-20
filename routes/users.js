var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    Q = require('q');


module.exports = router;

router.get('/', function (req, res) {
    if (!req.session || !req.session.cas_user || !req.session.is_authenticated) {
        res.json({
            authenticated: false,
            username: null,
            ec: false,
            wtg: false
        });
    } else {
        res.json({
            authenticated: req.session.is_authenticated,
            username: req.session.cas_user.toLowerCase(),
            ec: req.session.ec_member,
            wtg: req.session.wtg_member
        });
    }
});

