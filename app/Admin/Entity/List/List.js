'use strict';

angular.module('transcript.admin.entity.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.entity.list', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Entity/List/List.html',
                    controller: 'AdminEntityListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Liste des entités'
            },
            tfMetaTags: {
                title: 'Liste des entités',
            },
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