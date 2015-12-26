// Remote Dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var CASAuthentication = require('cas-authentication');

// Routes 
var routes = require('./routes/index');
var offices = require('./routes/offices');
var candidates = require('./routes/candidates');
var cas_actions = require('./routes/users');

var Q = require('q'),
    cms = require('./cms.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Set up an Express session, which is required for CASAuthentication.
app.use(session({
    secret: 'super secret key',
    resave: false,
    saveUninitialized: true
}));

// Create a new instance of CASAuthentication.
var cas = new CASAuthentication({
    cas_url: 'https://cas-auth.rpi.edu/cas',
    service_url: 'http://localhost:3000',
    cas_version: '2.0'
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use('/', routes);
app.use('/api/offices', offices);
app.use('/api/candidates', candidates);

app.use('/api/users', cas_actions);

app.get('/login', cas.bounce, function (req, res) {
    if (!req.session || !req.session.cas_user) {
        res.redirect('/logout');
    }

    var rcs_id = req.session.cas_user.toLowerCase();

    Q.all([
        cms.getWTG(rcs_id),
        cms.getRNE(rcs_id)
    ]).then(function (responses) {
        var status = false;

        responses.forEach(function(elem) {
            elem = JSON.parse(elem);
            if(elem.result) {
                status = true;
            }
        });

        req.session.admin_rights = status;
        req.session.is_authenticated = true;

        res.redirect('/');
    });
});

app.get('/logout', cas.logout);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
