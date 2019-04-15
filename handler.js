'use strict';
console.log('Loading function');
let moment = require('moment');
let uuid = require('node-uuid');
let _ = require('underscore');
let AWS = require('aws-sdk');
let creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
const dynamoConfig = {
    credentials: creds,
    region: process.env.AWS_REGION
};
const docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const ddbTable = 'mobile-notes';
/**
* Provide an event that contains the following keys:
*
* - resource: API Gateway resource for event
* - path: path of the HTTPS request to the microservices API call
* - httpMethod: HTTP method of the HTTPS request from microservices API
call
* - headers: HTTP headers for the HTTPS request from microservices API
call
* - queryStringParameters: query parameters of the HTTPS request from
microservices API call
* - pathParameters: path parameters of the HTTPS request from
microservices API call
* - stageVariables: API Gateway stage variables, if applicable
* - body: body of the HTTPS request from the microservices API call
*/
module.exports.handler = function(event, context, callback) {
    console.log(event);
    let _response = "";
    let invalid_path_err = {
        "Error": "Invalid path request " + event.resource + ', ' + event.httpMethod
    };
    if (event.resource === '/tasks' && event.httpMethod === "GET") {
        console.log("listing the tasks for a user");
        var params = {
            TableName: ddbTable,
            KeyConditionExpression: 'userid = :uid',
            ExpressionAttributeValues: {
                ':uid': event.queryStringParameters.userid
            }
        };
        docClient.query(params, function(err, resp) {
            if (err) {
                console.log(err);
                _response = buildOutput(500, err);
                return callback(_response, null);
            }
            if (resp.Items) {
                switch (event.queryStringParameters.filter) {
                    case "week":
                        resp.Items = _.filter(resp.Items, function(task) {
                            return moment(task.datedue).utc() >=
                            moment().utc().startOf('week') && moment(task.datedue).utc() <=
                            moment().utc().endOf('week');
                        });
                    break;
                    case "today":
                        resp.Items = _.filter(resp.Items, function(task) {
                            return moment(task.datedue).utc() >= 
                            moment().utc().set('hour', '00').set('minute', '00')
                            .set('second', '00').set('millisecond', '00') 
                            && moment(task.datedue).utc() <=
                            moment().utc().set('hour', '23').set('minute', '59');
                        });
                    break;
                    case "doingnow":
                        resp.Items = _.filter(resp.Items, function(task) {
                            return task.stage == "Started";
                        });
                    break;
                    case "done":
                        resp.Items = _.filter(resp.Items, function(task) {
                            return task.stage == "Done";
                        });
                    break;
                    default:
                        resp.Items = resp.Items;
                    break;
                }

                if (resp.Items) {
                    resp.Count = resp.Items.length;
                } 
                else {
                    resp.Count = 0;
                }
            }
            _response = buildOutput(200, resp);
            return callback(null, _response);
        });
    } 
    else if (event.resource === '/tasks/{taskid}' && event.httpMethod === "POST") {
        console.log("creating a new task for a user");
        let task = JSON.parse(event.body);
        //create unique taskid for the new task
        task.taskid = uuid.v4();
        //set the created datetime stamp for the new task
        task.createdAt = moment().utc().format();
        let params = {
            TableName: ddbTable,
            Item: task
        };
        docClient.put(params, function(err, data) {
            if (err) {
                console.log(err);
                _response = buildOutput(500, err);
                return callback(_response, null);
            }
            _response = buildOutput(200, task);
            return callback(null, _response);
        });
    } 
    else if (event.resource === '/tasks/{taskid}' && event.httpMethod === "PUT") {
        console.log("updating a task for a user");
        let task = JSON.parse(event.body);
        let params = {
            TableName: ddbTable,
            Item: task
        };
        docClient.put(params, function(err, data) {
            if (err) {
                console.log(err);
                _response = buildOutput(500, err);
                return callback(_response, null);
            }
            _response = buildOutput(200, task);
            return callback(null, _response);
        });
    } 
    else if (event.resource === '/tasks/{taskid}' && event.httpMethod === "DELETE") {
        console.log("delete a user's task");
        let params = {
            TableName: ddbTable,
            Key: {
                userid: event.queryStringParameters.userid,
                taskid: event.pathParameters.taskid
            }
        };
        docClient.delete(params, function(err, data) {
            if (err) {
                console.log(err);
                _response = buildOutput(500, err);
                return callback(_response, null);
            }
            _response = buildOutput(200, data);
            return callback(null, _response);
        });
    } 
    else if (event.resource === '/tasks/{taskid}' && event.httpMethod === "GET") {
        console.log("get a user's task");
        let params = {
            TableName: ddbTable,
            Key: {
                userid: event.queryStringParameters.userid,
                taskid: event.pathParameters.taskid
            } 
        };
        docClient.get(params, function(err, data) {
            if (err) {
                console.log(err);
                _response = buildOutput(500, err);
                return callback(_response, null);
            }
            _response = buildOutput(200, data);
            return callback(null, _response);
        });
    } 
    else {
        _response = buildOutput(500, invalid_path_err);
        return callback(_response, null);
    }
};
/* Utility function to build HTTP response for the microservices output */
function buildOutput(statusCode, data) {
    let _response = {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(data)
    };
    return _response;
};
