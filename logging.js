var mysql = require('mysql');
var connection = mysql.createConnection(require('./db.js'));

//Functions
//Date Time
function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

//Insert
function log(connection, rcsid, type, description) {
  connection.query("INSERT INTO log (rcs_id, type, description) VALUES ('" + rcsid + "', '" + type + "', '" + description + "')");
}

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

connection.end();