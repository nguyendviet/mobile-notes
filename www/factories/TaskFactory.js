angular.module('git2it.factory.task', ['ngResource', 'git2it.utils', 'git2it.service.auth'])

.factory('taskFactory', function($q, $_, $localstorage, $resource, authService) {

    var factory = {};

    var tasks_resource = function(token) {
        var _url = [APIG_ENDPOINT, 'tasks'].join('/');
        return $resource(_url, {}, {
            query: {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            }
        });
    };

    var tasks_task_resource = function(token) {
        var _url = [APIG_ENDPOINT, 'tasks/:taskId'].join('/');
        return $resource(_url, {
            taskId: '@taskId'
        }, {
            get: {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            },
            create: {
                method: 'POST',
                headers: {
                    'Authorization': token
                }
            },
            update: {
                method: 'PUT',
                headers: {
                    'Authorization': token
                }
            },
            remove: {
                method: 'DELETE',
                headers: {
                    'Authorization': token
                }
            }
        });
    };

    factory.listTasks = function(filter, cb) {

        authService.getUserAccessTokenWithUsername().then(function(data) {
            tasks_resource(data.token.jwtToken).query({
                userid: data.username,
                filter: filter
            }, function(data) {
                return cb(null, data.Items);
            }, function(err) {
                return cb(err, null);
            });
        }, function(msg) {
            console.log("Unable to retrieve the user session.");
            $state.go('login', {});
        });

    };

    factory.getTask = function(taskid, cb) {

        authService.getUserAccessTokenWithUsername().then(function(data) {
            tasks_task_resource(data.token.jwtToken).get({
                taskId: taskid,
                userid: data.username
            }, function(data) {
                if ($_.isEmpty(data)) {
                    return cb(null, data);
                }
                return cb(null, data.Item);
            }, function(err) {
                return cb(err, null);
            });
        }, function(msg) {
            console.log("Unable to retrieve the user session.");
            $state.go('login', {});
        });

    };

    factory.createTask = function(taskTitle, taskDateDue, taskDetails, taskStage, cb) {

        authService.getUserAccessTokenWithUsername().then(function(data) {
            var _task = {
                userid: data.username,
                title: taskTitle,
                datedue: taskDateDue,
                details: taskDetails,
                stage: taskStage
            };

            tasks_task_resource(data.token.jwtToken).create({
                taskId: "new"
            }, _task, function(data) {
                if ($_.isEmpty(data)) {
                    return cb(null, data);
                }
                return cb(null, data);
            }, function(err) {
                return cb(err, null);
            });
        }, function(msg) {
            console.log("Unable to retrieve the user session.");
            $state.go('login', {});
        });

    };

    factory.updateTask = function(task, cb) {

        authService.getUserAccessTokenWithUsername().then(function(data) {
            tasks_task_resource(data.token.jwtToken).update({
                taskId: task.taskid,
                userid: data.username
            }, task, function(data) {
                if ($_.isEmpty(data)) {
                    return cb(null, data);
                }
                return cb(null, data);
            }, function(err) {
                return cb(err, null);
            });
        }, function(msg) {
            console.log("Unable to retrieve the user session.");
            $state.go('login', {});
        });

    };

    factory.deleteTask = function(taskid, cb) {

        authService.getUserAccessTokenWithUsername().then(function(data) {
            tasks_task_resource(data.token.jwtToken).remove({
                taskId: taskid,
                userid: data.username
            }, function(data) {
                return cb(null, data);
            }, function(err) {
                return cb(err, null);
            });
        }, function(msg) {
            console.log("Unable to retrieve the user session.");
            $state.go('login', {});
        });

    };

    return factory;


});
