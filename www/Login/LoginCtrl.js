angular.module('git2it.login', ['git2it.service.auth'])
    .controller('LoginCtrl', function($scope, $state, $ionicHistory, $ionicLoading, authService) {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });

        $scope.registerActive = false;
        $scope.errormessage = "";

        $scope.showSignIn = function() {
            $scope.registerActive = false;
        }

        $scope.showRegister = function() {
            $scope.registerActive = true;
        }

        $scope.login = function(user, isValid) {

            if (isValid) {
                $ionicLoading.show();
                authService.signin(user).then(function(result) {
                    console.log(result);
                    console.log('access token + ' + result.getIdToken().getJwtToken());
                    $state.go('app.tasks', {});
                }, function(msg) {
                    console.log(msg);
                    $scope.errormessage = "Unable to sign in user. Please check your username and password.";
                    $ionicLoading.hide();
                    if ($scope.$$phase != '$digest') {
                        $scope.$apply();
                    }
                    return;
                });
            } else {
                $scope.errormessage = "There are still invalid fields.";
                $ionicLoading.hide();
            }
        }

        $scope.register = function(newuser, isValid) {
            console.log(newuser);

            if (isValid) {
                $ionicLoading.show();
                authService.signup(newuser).then(function() {
                    $ionicLoading.hide();
                    $state.go('confirm', {});
                }, function(msg) {
                    $scope.errormessage = "An unexpected error has occurred. Please try again.";
                    $ionicLoading.hide();
                    $scope.$apply();
                    return;
                });

            } else {
                $scope.errormessage = "There are still invalid fields.";
                $ionicLoading.hide();
                $scope.$apply();
            }
        }

    });
