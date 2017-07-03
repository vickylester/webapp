'use strict';

angular.module('transcript.app.security.check', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('check', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                        controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/Security/Check/Check.html',
                        controller: 'AppSecurityCheckCtrl'
                }
            },
            url: '/register/check'
        })
    }])

    .controller('AppSecurityCheckCtrl', ['$rootScope','$scope', '$http', '$sce', function($rootScope, $scope, $http, $sce) {
        $scope.page = {};
    }])
;