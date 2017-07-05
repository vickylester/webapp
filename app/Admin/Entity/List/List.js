'use strict';

angular.module('transcript.admin.entity.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.entity.list', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/Entity/List/List.html',
                    controller: 'AdminEntityListCtrl'
                }
            },
            url: '/list'
        })
    }])

    .controller('AdminEntityListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;