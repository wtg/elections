var db = require('./config.js').db,
    mysql = require('mysql'),
    cms = require('./cms.js'),
    db_name = mysql.escapeId(require('./config.js').db_name);

exports.dbConnect = function (res) {
    var connection = mysql.createConnection(db);
    connection.connect();
    connection.query("USE " + db_name, function (err) {
        if (err) {
            console.error(err);
            if(res) {
                res.status(500);
            }
        }
    });
    return connection;
};

exports.dbName = function () {
    return db_name;
};

exports.activeElectionSubquery = function () {
    return "(SELECT `value` FROM " + db_name + ".`configurations` WHERE `key` = 'active_election_id')"
};

exports.generalizeRoute = function (router, type, path, queryFunc, needsAdmin, logType, successResultFunc, authorizedFunc) {
    router[type](path, function (req, res) {
        if(type === 'post' && !req.body) {
            res.status(400);
            return;
        }

        if ((needsAdmin && !exports.verifyPermissions(req).admin) || (authorizedFunc && !authorizedFunc())) {
            res.status(401);
            return;
        }

        var connection = exports.dbConnect(res);

        connection.query(queryFunc(req, db_name), exports.defaultJSONCallback(res, successResultFunc));

        if(logType) {
            exports.log(connection, req.session.cas_user, logType, req.body || req.params || '');
        }

        connection.end();
    });
};

exports.massProduceRoutes = function (router, routes) {
    routes.forEach(function (elem) {
        exports.generalizeRoute(router, elem.method, elem.path, elem.queryFunc, elem.needsAdmin,
            elem.logType, elem.successResultFunc, elem.authorizedFunc);
    });
};

exports.defaultJSONCallback = function (res, successResultFunc) {
    return function (err, result) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }

        res.json(successResultFunc ? successResultFunc(result) : result);
    };
};

exports.constructSQLArray = function (values) {
    var array = '(';

    values.forEach(function(elem, index) {
        array += mysql.escape(elem) + ( index < values.length -1 ? ', ' : ')');
    });

    return array;
};

exports.verifyPermissions = function(req) {
    if (!req.session || !req.session.cas_user || !req.session.is_authenticated) {
        return {
            'authenticated': false,
            'username': null,
            'admin': false
        };
    }

    return {
        authenticated: req.session.is_authenticated,
        username: req.session.cas_user.toLowerCase(),
        admin: req.session.admin_rights
    };
};

exports.log = function (connection, rcsid, type, description) {
    var providedConnection = true;

    if(!connection) {
        providedConnection = false;
        connection = functions.dbConnect();
    }

    connection.query("INSERT INTO log (rcs_id, type, description, time) VALUES ('" + rcsid + "', '" + type + "', " + mysql.escape(description) + ", NOW())");

    if(!providedConnection) {
        connection.end();
    }
};

exports.determineCMSPromise = function(rcs_id) {
    console.log(rcs_id);
    return isNaN(parseInt(rcs_id)) ? cms.getRCS(rcs_id) : cms.getRIN(rcs_id);
};
