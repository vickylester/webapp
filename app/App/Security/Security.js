'use strict';

angular.module('transcript.app.security', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.security', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                        controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/Security/Security.html',
                        controller: 'AppSecurityCtrl'
                }
            },
            url: '/security'
        })
    }])

    .controller('AppSecurityCtrl', ['$rootScope','$scope', '$http', '$sce', function($rootScope, $scope, $http, $sce) {
        $scope.page = {};
    }])
;