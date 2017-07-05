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
            url: '/list',
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities();
                }
            }
        })
    }])

    .controller('AdminEntityListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entities', function($rootScope, $scope, $http, $sce, $state, entities) {
        $scope.entities = entities;
    }])
;