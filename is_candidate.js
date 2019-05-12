// this is seperate file because functions.js depends on it along with app.js

var db = require('./config.js').db,
    MySql = require('sync-mysql'),
    db_name = require('./config.js').db_name;

module.exports = {
	isCurrentCandidate: function (rcs_id) {

    var connection = new MySql({
      host: db.host,
      user: db.user,
      password: db.password,
      database: db_name
    });

    const result = connection.query("SELECT * FROM `candidates` " +
    "WHERE `election_id` = (SELECT `value` FROM `configurations` WHERE `key` = 'active_election_id')" +
    " AND `rcs_id` = '" + rcs_id + "'");

    return result.length > 0;
	},
};
