var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    functions = require('../functions.js'),
    cms = require('../cms.js'),
    logger = require('../logger.js');

    var queries =  {
      all: "SELECT rcs_id FROM " + functions.dbName() + ".`sanctions`",
      all_one_rcs: "SELECT election_id FROM " + functions.dbName() + ".`sanctions` WHERE rcs_id = %1",
      all_one_election: "SELECT rcs_id FROM " + functions.dbName() + ".`sanctions` WHERE election_id = %2",
      get: "SELECT * FROM " + functions.dbName() + ".`sanctions` WHERE rcs_id = %1 AND election_id = %2",
      create: "INSERT INTO " + functions.dbName() + ".`sanctions` (`rcs_id`, `election_id`, `description`) VALUES ",
      update: "UPDATE " + functions.dbName() + ".`sanctions` SET <> WHERE sanction_id = ",
      delete: "DELETE FROM " + functions.dbName() + ".`sanctions` WHERE sanction_id = "
    }

    router.get("/", function (req, res) {
      var connection = functions.dbConnect(res);
      connection.query(queries.all, functions.defaultJSONCallback(res));
      connection.end();
    });

    router.get("/rcs/:rcs_id", function (req, res) {
      var connection = functions.dbConnect(res),
        rcs_id = req.params.rcs_id;

      connection.query(queries.all_one_rcs.replace(/%1/g, mysql.escape(rcs_id)), functions.defaultJSONCallback(res));
      connection.end();
    });

    router.post("/create/:election_id/:rcs_id", function (req, res) {
      if (!functions.verifyPermissions(req).admin) {
          res.status(401);
          return;
      }

      var data = req.body;
      if (!data) { res.status(204); return; }

      var connection = functions.dbConnect(res),
        rcs_id = req.params.rcs_id,
        election_id = req.params.election_id;

      var query = queries.create + functions.constructSQLArray([
              rcs_id, election_id, data.description
          ]);

      connection.query(query, functions.defaultJSONCallback(res));

      logger.write(connection, req.session.cas_user, "SANCTION_CREATE", "Issued on user " + data.rcs_id +
          ", description: " + (data.description.length >= 100 ? data.description.substr(0,100) + '...' : data.description));

      connection.end();
    });

    router.put("/update/:sanction_id", function (req, res) {
      if (!functions.verifyPermissions(req).admin) {
          res.sendStatus(401);
          return;
      }

      var data = req.body;
      if (!data) { res.status(204); return; }

      var connection = functions.dbConnect(res),
        sanction_id = req.params.sanction_id;

      var assignments = "`rcs_id` = " + mysql.escape(data.rcs_id) + ", `election_id` = " + mysql.escape(data.election_id) +
          ", `date` = " + mysql.escape(data.date) + ", `description` = " + mysql.escape(data.description);

      var query = queries.update.replace(/<>/g, assignments) + sanction_id;

      connection.query(query, functions.defaultJSONCallback(res));

      logger.write(connection, req.session.cas_user, "SANCTION_MODIFY", "Modified sanction with id " + data.sanction_id +
          " on user " + data.rcs_id + ", description: " + (data.description.length >= 100 ? data.description.substr(0,100) + '...' : data.description));
      connection.end();
    });

    router.delete("/delete/:sanction_id", function (req, res) {
      var connection = functions.dbConnect(res),
        sanction_id = req.params.sanction_id;

      connection.query(queries.delete + sanction_id, functions.defaultJSONCallback(res));

      logger.write(connection, req.session.cas_user, "SANCTION_DELETE", "Deleted " + sanction_id);
      connection.end();
    });

    router.get("/:election_id", function (req, res) {
      var connection = functions.dbConnect(res),
        election_id = req.params.election_id;

      connection.query(queries.all_one_election.replace(/%2/g, mysql.escape(election_id)), functions.defaultJSONCallback(res));
      connection.end();
    });

    router.get("/:election_id/:rcs_id", function (req, res) {
      var connection = functions.dbConnect(res),
        rcs_id = req.params.rcs_id,
        election_id = req.params.election_id;

      connection.query(queries.get.replace(/%1/g, mysql.escape(rcs_id)).replace(/%2/g, mysql.escape(election_id)), functions.defaultJSONCallback(res));
      connection.end();
    });

module.exports = router;
