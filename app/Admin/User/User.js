'use strict';

angular.module('transcript.admin.user', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.user', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/User/User.html',
                    controller: 'AdminUserCtrl'
                }
            },
            url: '/users'
        })
    }])

    .controller('AdminUserCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;