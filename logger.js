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