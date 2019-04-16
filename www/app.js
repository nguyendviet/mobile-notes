// Git2It Sample App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'git2it' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('git2it', ['ionic',
    'ngMessages',
    'git2it.service.auth',
    'git2it.menu',
    'git2it.login',
    'git2it.confirm',
    'git2it.tasks',
    'git2it.task',
    'git2it.about'
])

.constant('$ionicLoadingConfig', {
    template: '<ion-spinner icon="bubbles" class="spinner-royal"></ion-spinner>'
})

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.filter('moment', function() {
    return function(dateString, format) {
        return moment(new Date(dateString)).format(format);
    };
})

.filter('setStatus', function() {
    return function(stage, datedue) {
        var _newStage = '';
        if (stage) {
            if (typeof datedue == 'object') {
                datedue = moment(datedue).toISOString();
            }
            _newStage = stage;
            if (stage.toLowerCase() === "not started" && moment(datedue, moment.ISO_8601).set('hour', 23).set(
                    'minute', 59) < moment()) {
                _newStage = "overdue";
            }
        }
        return _newStage;
    };
})

.filter('statusColor', function() {
    return function(stage, datedue) {
        var _c = '';
        if (stage) {
            if (typeof datedue == 'object') {
                datedue = moment(datedue).toISOString();
            }
            if (stage.toLowerCase() === "not started" && moment(datedue, moment.ISO_8601).set('hour', 23).set(
                    'minute', 59) < moment()) {
                stage = "overdue";
            }
            switch (stage.toLowerCase()) {
                case "not started":
                    _c += 'notstarted';
                    break;
                case "started":
                    _c += 'started';
                    break;
                case "done":
                    _c += 'done';
                    break;
                case "overdue":
                    _c += 'overdue';
                    break;
                default:
                    break;
            }
        }

        return _c;
    };
})

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

        .state('login', {
        url: '/login',
        templateUrl: 'Login/Login.html',
        controller: 'LoginCtrl'
    })

    .state('confirm', {
        url: '/confirm',
        templateUrl: 'Confirm/Confirm.html',
        controller: 'ConfirmCtrl'
    })

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'Menu/menu.html',
        controller: 'MenuCtrl'
    })


    .state('app.tasks', {
        url: '/tasks/:filter',
        views: {
            'menuContent': {
                templateUrl: 'Tasks/Tasks.html',
                controller: 'TasksCtrl'
            }
        },
        authenticate: true
    })

    .state('app.task', {
        url: '/task/:taskid',
        views: {
            'menuContent': {
                templateUrl: 'Tasks/Task.html',
                controller: 'TaskCtrl'
            }
        },
        authenticate: true
    })

    .state('app.about', {
        url: '/about',
        views: {
            'menuContent': {
                templateUrl: 'About/About.html',
                controller: 'AboutCtrl'
            }
        },
        authenticate: true
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

})

.run(function($rootScope, $state, authService) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if (toState.authenticate) {
            authService.isAuthenticated().then(function(authenticated) {
                if (!authenticated) {
                    // User isn’t authenticated
                    $state.transitionTo("signin");
                    event.preventDefault();
                }
            }).catch(function(result) {
                // User isn’t authenticated
                $state.transitionTo("signin");
                event.preventDefault();
            });
        }
    });
});
