angular.module('git2it.task', ['git2it.service.auth', 'git2it.factory.task'])
    .controller('TaskCtrl', function($scope, $state, $ionicModal, $ionicLoading, $ionicHistory, $stateParams, $ionicPopup,
        authService, taskFactory) {

        $ionicHistory.nextViewOptions({
            disableBack: true
        });

        var loadTask = function() {
            $ionicLoading.show();
            taskFactory.getTask($stateParams.taskid, function(err, task) {
                if (err) {
                    console.log(err);
                    var alertPopup = showErrorPopup($ionicPopup);
                    $ionicLoading.hide();
                    return;
                }
                task.datedue = new Date(task.datedue);
                $scope.task = task;
                $ionicLoading.hide();
            });
        };

        var updateTask = function() {
            $ionicLoading.show();
            taskFactory.updateTask($scope.task, function(err, data) {
                if (err) {
                    console.log(err);
                    var alertPopup = showErrorPopup($ionicPopup);
                    $ionicLoading.hide();
                    return;
                }
                loadTask();
            });
        };

        $ionicModal.fromTemplateUrl('edit-task.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.editModal = modal;
        });

        $scope.updateStage = function(newStage) {
            $scope.task.stage = newStage;
            updateTask();
        }

        $scope.cancelEditModal = function() {
            $scope.editModal.hide();
            loadTask();
        };

        $scope.closeEditModal = function() {
            console.log($scope.task.title, $scope.task.datedue, $scope.task.details, $scope.task.stage);
            updateTask();
            $scope.editModal.hide();
        };

        $scope.openEditModal = function() {
            $scope.editModal.show()
        };

        loadTask();
    });

var showErrorPopup = function(ionicPopup) {
    return ionicPopup.alert({
        title: 'Oops!',
        template: "Something happended that we should have avoided!?!"
    });
};
