var db = require('./db.js'),
    mysql = require('mysql');

module.exports = {
    dbConnect: function (res) {
        var connection = mysql.createConnection(db);
        connection.connect();
        connection.query("USE `rpielections`;", function (err) {
            if (err) {
                console.error(err);
                res.status(500);
            }
        });
        return connection;
    },
    defaultJSONCallback: function (res) {
        return function (err, result) {
            if (err) {
                console.log(err);
                res.status(500);
            }

            res.json(result);
        };
    }
}