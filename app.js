// Remote Dependencies
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var CASAuthentication = require('cas-authentication');
var history = require('connect-history-api-fallback');
var Q = require('q');
var cms = require('./cms.js');
var config = require('./config.js');
var custom_logger = require('./logger.js');
var functions = require('./functions.js');
const winston = require('winston');
const util = require('util');
var isCurrentCandidate = require('./is_candidate.js').isCurrentCandidate;

// Middleware
const csp = require('./csp');

// Routes
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
// app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Persistent sessions stored in MySQL
var sessionStore = new MySQLStore({}, functions.dbConnect());

// Set up an Express session, which is required for CASAuthentication.
app.use(session({
  secret: config.session_secret,
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
  dev_mode_user: config.cas_dev_mode_user,
  destroy_session: true,
});

// determine where we're running
const environment = process.env.NODE_ENV || 'development';

// Set up Winston for logging
winston.configure({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(info => {
      let msg = ``;
      // hide timestamp in production (dokku prefixes logs with one already)
      if (environment !== 'production') {
        msg += `${info.timestamp} `;
      }
      msg += `${info.level}: ${info.message}`;
      const meta = {};
      // don't copy things we've already printed
      for (const prop of Object.getOwnPropertyNames(info)) {
        if (prop != 'level' && prop != 'message' && prop != 'timestamp') {
          meta[prop] = info[prop];
        }
      }
      if (Object.keys(meta).length !== 0) {
        msg += ` ${util.inspect(meta, { colors: true })}`;
      }
      return msg;
    })
  )
});

app.use(logger('dev'));
app.use(bodyParser.json({ type: ['application/json', 'application/csp-report'] }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csp);

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
    cms.getEC(rcs_id)
  ]).then(function (responses) {
    var wtg_status = JSON.parse(responses[0]).result,
      ec_status = JSON.parse(responses[1]).result;

    if ((wtg_status || ec_status) && !isCurrentCandidate(rcs_id)) {
      var logger_desc = "Granted admin access by CMS for ";
      if (wtg_status) logger_desc += "WTG ";
      if (wtg_status && ec_status) logger_desc += "and ";
      if (ec_status) logger_desc += "EC ";
      logger_desc += "membership";

      custom_logger.write(null, req.session.cas_user, 'CMS_ADMIN', logger_desc);
    }

    req.session.is_authenticated = true;
    req.session.ec_member = ec_status;
    req.session.wtg_member = wtg_status;

    res.redirect('/');
  });
});
app.get('/logout', cas.logout);

// serve /index.html for non-JSON GET requests
app.use(history());

if (environment === 'production') {
  winston.info('Production mode; serving static files from ./dist');
  app.use('/', express.static(path.join(__dirname, '/dist')));
} else if (environment === 'development') {
  winston.info('Development mode; enabling Webpack middleware');
  // Webpack
  var webpack = require('webpack');
  var webpackDevMiddleware = require('webpack-dev-middleware');

  const webpackConfig = require('./webpack.dev.js');
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
  }));
  app.use(require("webpack-hot-middleware")(compiler));
}

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
