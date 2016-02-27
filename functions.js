var db = require('./config.js').db,
    mysql = require('mysql'),
    cms = require('./cms.js'),
    db_name = mysql.escapeId(require('./config.js').db_name);

module.exports = {
    dbConnect: function (res) {
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
    },
    dbName: function () {
        return db_name;
    },
    defaultJSONCallback: function (res) {
        return function (err, result) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
            }

            res.json(result);
        };
    },
    constructSQLArray: function (values) {
        var array = '(';

        values.forEach(function(elem, index) {
            array += mysql.escape(elem) + ( index < values.length -1 ? ', ' : ')');
        });

        return array;
    },
    verifyPermissions: function(req) {
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
    },
    log: function (connection, rcsid, type, description) {

      /*Not sure if connection is needed now*/
      /*Can rcsid be replaced with a session variable?*/
      var providedConnection = true;

      if(!connection) {
        providedConnection = false;
        connection = functions.dbConnect();
      }

      connection.query("INSERT INTO log (rcs_id, type, description, time) VALUES ('" + rcsid + "', '" + type + "', '" + description + "', NOW())");

      if(!providedConnection) {
        connection.end();
      }
    },
    determineCMSPromise: function(rcs_id) {
        console.log(rcs_id);
        return isNaN(parseInt(rcs_id)) ? cms.getRCS(rcs_id) : cms.getRIN(rcs_id);
    }
};