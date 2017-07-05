'use strict';

angular.module('transcript.admin.entity', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.entity', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/Entity/Entity.html',
                    controller: 'AdminEntityCtrl'
                }
            },
            url: '/entities',
            abstract: true
        })
    }])

    .controller('AdminEntityCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;