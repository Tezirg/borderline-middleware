const QueryFactory = require('../core/queryFactory.js');
const { ErrorHelper } = require('borderline-utils');

/**
 * @fn ExecutionController
 * @desc Manager for the execution related endpoints
 * @param queryCollection MongoDB collection queries storage
 * @param storage Object storage abstract class instance used by some query results
 * @constructor
 */
function ExecutionController(queryCollection, storage) {
    this.queryCollection = queryCollection;
    this.storage = storage;
    this.queryFactory = new QueryFactory(queryCollection, storage);

    //Bind member functions
    this.executeQuery = ExecutionController.prototype.executeQuery.bind(this);
    this.getQueryById = ExecutionController.prototype.getQueryById.bind(this);
}

/**
 * @fn executeQuery
 * @desc Executes the query identified by the query_id
 * @param req Express.js request object
 * @param res Express.js response object
 */
ExecutionController.prototype.executeQuery = function(req, res) {
    let _this = this;

    if (req.body === null || req.body === undefined ||
        req.body.query === undefined) {
        res.status(401);
        res.json({error: 'Requested execution is missing parameters'});
        return;
    }
    let query_id = req.body.query;

    _this.queryFactory.fromID(query_id).then(function(queryObject) {
        queryObject.execute(req).then(function(result) {
            res.status(200);
            res.json(result);
        }, function (error) {
            res.status(401);
            res.json(ErrorHelper('Execute query failed', error));
        });
    }, function (error) {
        res.status(401);
        res.json(ErrorHelper('Unknown query ' + query_id, error));
    });
};

/**
 * @fn getQueryById
 * @desc Retreive the current execution status for a specific query
 * @param req Express.js request object
 * @param res Express.js response object
 */
ExecutionController.prototype.getQueryById = function(req, res) {
    let query_id = req.params.query_id;
    if (query_id === undefined || query_id === null) {
        res.status(401);
        res.json(ErrorHelper('Missing query_id'));
        return;
    }
    this.queryFactory.fromID(query_id).then(function(queryObject) {
        res.status(200);
        res.json(queryObject.model.status);
    }, function (error) {
       res.status(401);
       res.json(ErrorHelper('Get query execution status failed', error));
    });
};

module.exports = ExecutionController;