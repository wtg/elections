var mysql = require('mysql');
var functions = require('./functions.js');

//Insert
exports.write = function (connection, rcsid, type, description) {
  var providedConnection = true;

  if(!connection) {
    providedConnection = false;
    connection = functions.dbConnect();
  }

  connection.query("INSERT INTO log (rcs_id, type, description, time) VALUES ('" + rcsid + "', '" + type + "', '" + description + "', NOW())");

  if(!providedConnection) {
    connection.end();
  }
};


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
