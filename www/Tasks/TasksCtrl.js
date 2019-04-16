angular.module('git2it.tasks', ['git2it.service.auth', 'git2it.factory.task'])
    .controller('TasksCtrl', function($scope, $state, $ionicModal, $ionicPopup, $ionicHistory, $stateParams, $ionicLoading,
        authService, taskFactory) {

        var _filter = "";

        $scope.tasks = [];
        $scope.data = {
            showDelete: false
        };

        if ($stateParams.filter) {
            _filter = $stateParams.filter;
        }

        // A utitlity function for loading user's tasks
        var loadTasks = function() {
            $ionicLoading.show();

            taskFactory.listTasks(_filter, function(err, tasks) {
                if (err) {
                    console.log(msg);
                    $ionicLoading.show();
                    var alertPopup = showErrorPopup($ionicPopup);
                    return;
                }
                $scope.tasks = _.sortBy(tasks, "datedue");
                $ionicLoading.hide();
            });
        };

        // A utitlity function for creating a new task
        var createTask = function(title, datedue, details, stage) {
            $ionicLoading.show();

            taskFactory.createTask(title, moment(datedue).utc().format(), details, stage, function(err, data) {
                if (err) {
                    console.log(err);
                    $ionicLoading.hide();
                    var alertPopup = showErrorPopup($ionicPopup);
                    return;
                }
                loadTasks();
            });
        };

        // A utitlity function for deleting a user's task
        var deleteTask = function(taskid) {
            $ionicLoading.show();
            taskFactory.deleteTask(taskid, function(err, data) {
                if (err) {
                    console.log(msg);
                    $ionicLoading.hide();
                    var alertPopup = showErrorPopup($ionicPopup);
                    return;
                }
                loadTasks();
            });
        };

        $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope
        });

        $scope.$watch('data.showDelete', function() {
            $scope.editText = $scope.data.showDelete ? 'Cancel' : 'Edit';
        });

        $scope.onTaskDelete = function(itemIndex) {
            deleteTask($scope.tasks[itemIndex].taskid);
        };

        $scope.addTask = function(task, isValid) {
            if (isValid) {
                createTask(task.title, task.datedue, task.details, task.stage);
                $scope.taskModal.hide();
                task.title = "";
                task.datedue = "";
                task.stage = "";
                task.details = "";
            } else {
                return $ionicPopup.alert({
                    title: 'Missing Data!',
                    template: "Please enter all the information for the task."
                });
            }
        };

        $scope.newTask = function() {
            $scope.task = {
                stage: "Not Started"
            }
            $scope.taskModal.show();
        };

        $scope.closeNewTask = function() {
            $scope.taskModal.hide();
        };

        $scope.$on('$destroy', function() {
            $scope.taskModal.remove();
        });

        loadTasks();

    });

var showErrorPopup = function(ionicPopup) {
    return ionicPopup.alert({
        title: 'Oops!',
        template: "Something happended that we should have avoided!?!"
    });
};
