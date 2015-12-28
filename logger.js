var mysql = require('mysql');
var connection = mysql.createConnection(require('./db.js'));

//Insert
exports.write = function (connection, rcsid, type, description) {
  connection.query("INSERT INTO log (rcs_id, type, description) VALUES ('" + rcsid + "', '" + type + "', '" + description + "')");
}


//Example Usage
/*var logger = require('./logger.js');
logger.write(connection, <rcs-id>, <type>, <description>);*/

//Testing Code
/*
connection.connect();
connection.query("USE rpielections");

log(connection, "testid", "test", "yet another test");

connection.query("SELECT * FROM log", function(err, rows, fields) {
  if(!err) {
    console.log("The result is ", rows);
  } else {
    console.log(err);
  }
});

connection.end();*/