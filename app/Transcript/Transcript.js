'use strict';

angular.module('transcript', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript', {
            abstract: true,
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'TranscriptCtrl'
                },
                "page" : {
                    templateUrl: 'Transcript/Transcript.html',
                    controller: 'TranscriptCtrl'
                },
                "footer" : {
                    templateUrl: 'System/Footer/Footer.html',
                    controller: 'TranscriptCtrl'
                }
            },
            url: '',
            resolve: {
                appPreference: function(AppService) {
                    return AppService.getPreference();
                },
                user: function(UserService) {
                    return UserService.getCurrent();
                }
            }
        })
    }])

    .controller('TranscriptCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', 'appPreference', function($rootScope, $scope, $http, $sce, $state, user, appPreference) {
        if (user !== null) {
            if($rootScope.user === undefined) {
                $rootScope.user = user;
            }
            console.log($rootScope.user);
        }
        $rootScope.preferences = appPreference;

        /* -- Loading management ------------------------------------------------------------------------------ */
        /*$scope.showSpinner = false;
        $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (toState.resolve) {
                $scope.showSpinner = true;
            }
        });
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.resolve) {
                $scope.showSpinner = false;
            }
        });*/
        /* -- Loading management ------------------------------------------------------------------------------ */
    }])
;