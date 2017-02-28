// Remote Dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var CASAuthentication = require('cas-authentication');
var Q = require('q');
var cms = require('./cms.js');
var config = require('./config.js');
var custom_logger = require('./logger.js');
var functions = require('./functions.js');

// Routes
var routes = require('./routes/index');
var ama = require('./routes/ama');
var assistants = require('./routes/assistants');
var offices = require('./routes/offices');
var candidates = require('./routes/candidates');
var nominations = require('./routes/nominations');
var parties = require('./routes/parties');
var events = require('./routes/events');
var users = require('./routes/users');
var static_routes = require('./routes/static');
var settings = require('./routes/settings');
var elections = require('./routes/elections');

// App initialization
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Persistent sessions stored in MySQL
var sessionStore = new MySQLStore({}, functions.dbConnect());

// Set up an Express session, which is required for CASAuthentication.
app.use(session({
    secret: process.env.SESSION_SECRET || 'super secret key',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

// Create a new instance of CASAuthentication.
var cas = new CASAuthentication({
    cas_url: 'https://cas-auth.rpi.edu/cas',
    service_url: config.service_url,
    cas_version: '2.0',
    is_dev_mode: config.cas_dev_mode,
    dev_mode_user: config.cas_dev_mode_user
});

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '/public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use('/', routes);
app.use('/images', express.static(__dirname + '/public/usr_content'));
app.use('/api/ama', ama);
app.use('/api/assistants', assistants);
app.use('/api/offices', offices);
app.use('/api/candidates', candidates);
app.use('/api/nominations', nominations);
app.use('/api/parties', parties);
app.use('/api/events', events);
app.use('/api/users', users);
app.use('/api/static', static_routes);
app.use('/api/settings', settings);
app.use('/api/elections', elections);

app.get('/login', cas.bounce, function (req, res) {
    if (!req.session || !req.session.cas_user) {
        res.redirect('/logout');
    }

    var rcs_id = req.session.cas_user.toLowerCase();

    Q.all([
        cms.getWTG(rcs_id),
        cms.getRNE(rcs_id)
    ]).then(function (responses) {
        var wtg_status = JSON.parse(responses[0]).result,
            rne_status = JSON.parse(responses[1]).result;

        if(wtg_status || rne_status) {
            var logger_desc = "Granted admin access by CMS for ";
            if(wtg_status) logger_desc += "WTG ";
            if(wtg_status && rne_status) logger_desc += "and ";
            if(rne_status) logger_desc += "RNE ";
            logger_desc += "membership";

            custom_logger.write(null, req.session.cas_user, 'CMS_ADMIN', logger_desc);
        }

        req.session.admin_rights = wtg_status || rne_status;
        req.session.is_authenticated = true;

        res.redirect('/');
    });
});

app.get('/logout', cas.logout);

app.get('/*', function(req, res){
    res.sendFile(__dirname + '/views/index.html');
});

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
        res.status(err.status || 500).send("<!DOCTYPE html><html><body><h1>There's an error (" + err.status + ")!</h1>" +
            "<p>" + err.message + "</p><p>" + err + "</p></body></html>");
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500).send("<!DOCTYPE html><html><body><h1>There's an error (" + err.status + ")!</h1>" +
        "<p>" + err.message + "</p></body></html>");
});

module.exports = app;
