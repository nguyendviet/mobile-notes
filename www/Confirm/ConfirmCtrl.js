angular.module('git2it.confirm', ['git2it.service.auth'])
.controller('ConfirmCtrl', function($scope, $state, $ionicHistory, authService) {
    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    $scope.errormessage = "";

    $scope.confirmAccount = function(newuser, isValid) {
        console.log(newuser);
        if (isValid) {
            newuser.username = newuser.email.replace("@", "_").replace(".", "_");
            console.log("Confirmation code " + newuser.confirmCode);

            authService.confirm(newuser).then(function(){
                $state.go('login', { });
            }, function(msg) {
                $scope.errormessage = "An unexpected error has occurred. Please try again.";
                $scope.$apply();
                return;
            });

        } else {
            $scope.errormessage = "There are still invalid fields.";
            $scope.$apply();
        }
    };

});
