'use strict';

angular.module('transcript.admin.entity.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.entity.edit', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/Entity/Edit/Edit.html',
                    controller: 'AdminEntityEditCtrl'
                }
            },
            url: '/edit'
        })
    }])

    .controller('AdminEntityEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;