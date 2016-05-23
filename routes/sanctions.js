var router    = require('express').Router();
var mysql     = require('mysql');
var functions = require('../functions');

function determineElectionId(e) {
    return e === 'active' ? functions.activeElectionSubquery() : mysql.escape(e);
}

functions.massProduceRoutes(router, [
    {
        method: 'get',
        path: '/',
        queryFunc: function (req, dbName) {
            return "SELECT rcs_id FROM " + dbName + ".`sanctions`";
        }
    },
    {
        method: 'get',
        path: '/rcs/:rcs_id',
        queryFunc: function (req, dbName) {
            return "SELECT election_id FROM " + dbName + ".`sanctions` WHERE rcs_id = " + mysql.escape(req.params.rcs_id);
        }
    },
    {
        method: 'get',
        path: '/:election_id',
        queryFunc: function (req, dbName) {
            var election_id = determineElectionId(req.params.election_id);
            return "SELECT rcs_id FROM " + dbName + ".`sanctions` WHERE election_id = " + election_id;
        }
    },
    {
        method: 'get',
        path: '/:election_id/:rcs_id',
        queryFunc: function (req, dbName) {
            var rcs_id = req.params.rcs_id;
            var election_id = determineElectionId(req.params.election_id);

            return "SELECT * FROM " + dbName + ".`sanctions` WHERE rcs_id = " + mysql.escape(rcs_id) + " AND election_id = " + election_id;
        }
    },
    {
        method: 'post',
        path: '/create/:election_id/:rcs_id',
        needsAdmin: true,
        logType: 'SANCTION_CREATE',
        queryFunc: function (req, dbName) {
            var rcs_id = req.params.rcs_id;
            var election_id = determineElectionId(req.params.election_id);
            var sqlArray = functions.constructSQLArray([
                rcs_id, election_id, req.body.description
            ]).replace(mysql.escape(election_id), election_id);

            return "INSERT INTO " + dbName + ".`sanctions` (`rcs_id`, `election_id`, `description`) VALUES " + sqlArray;
        }
    },
    {
        method: 'put',
        path: '/update/:sanction_id',
        needsAdmin: true,
        logType: 'SANCTION_MODIFY',
        queryFunc: function (req, dbName) {
            var data = req.body;
            var sanction_id = req.params.sanction_id;

            var assignments = "`rcs_id` = " + mysql.escape(data.rcs_id) + ", `election_id` = " + mysql.escape(data.election_id) +
                ", `date` = " + mysql.escape(data.date) + ", `description` = " + mysql.escape(data.description);

            return "UPDATE " + dbName + ".`sanctions` SET " + assignments + "WHERE sanction_id = " + sanction_id;
        }
    },
    {
        method: 'delete',
        path: '/delete/:sanction_id',
        needsAdmin: true,
        logType: 'SANCTION_DELETE',
        queryFunc: function (req, dbName) {
            return "DELETE FROM " + dbName + ".`sanctions` WHERE sanction_id = " + mysql.escape(req.params.sanction_id);
        }
    }
]);

module.exports = router;
