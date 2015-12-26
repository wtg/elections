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
            'authenticated': false,
            'username': null,
            'admin': false
        });
    }

    //var rcs_id = req.session.cas_user.toLowerCase();

    res.json({
        authenticated: req.session.is_authenticated,
        username: req.session.cas_user.toLowerCase(),
        admin: req.session.admin_rights
    });

    //Q.all([
    //    cms.getWTG(rcs_id),
    //    cms.getRNE(rcs_id)
    //]).then(function(responses) {
    //    var status = false;
    //
    //    responses.forEach(function(elem) {
    //        elem = JSON.parse(elem);
    //        if(elem.result) {
    //            status = true;
    //        }
    //    });
    //
    //    res.json({
    //        'authenticated': true,
    //        'username': rcs_id,
    //        'admin': status
    //    });
    //}, function(responses) {
    //    console.log(responses);
    //});
});

