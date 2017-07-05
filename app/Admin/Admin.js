'use strict';

angular.module('transcript.admin', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/Admin.html',
                    controller: 'AdminCtrl'
                }
            },
            url: '/admin',
            abstract: true
        })
    }])

    .controller('AdminCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
        $scope.page = {};
    }])
;