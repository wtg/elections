var express = require('express');
var router = express.Router();

exports.index = function(req, res){
res.render('index', { title: 'ejs' });};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
