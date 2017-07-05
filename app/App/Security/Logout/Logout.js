'use strict';

angular.module('transcript.app.security.logout', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.security.logout', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                        controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/Security/Logout/Logout.html',
                        controller: 'AppSecurityLogoutCtrl'
                }
            },
            url: '/logout'
        })
    }])

    .controller('AppSecurityLogoutCtrl', ['$rootScope', '$scope', '$http', '$sce', '$state', '$cookies', function($rootScope, $scope, $http, $sce, $state, $cookies) {
        if($rootScope.user !== undefined) {
            delete $rootScope.access_token;
            delete $rootScope.user;
            $cookies.remove('transcript_security_token');
            $state.go('app.home');
        } else {
            $state.go('app.home');
        }
    }])
;