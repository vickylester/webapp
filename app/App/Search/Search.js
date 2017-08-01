'use strict';

angular.module('transcript.app.search', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.search', {
            views: {
                "page" : {
                    templateUrl: 'App/Search/Search.html',
                    controller: 'AppSearchCtrl'
                }
            },
            url: '/search',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Recherche'
            },
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities();
                }
            }
        })
    }])

    .controller('AppSearchCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'entities', 'EntityService', function($rootScope, $scope, $http, $sce, $state, flash, entities, EntityService) {
        $scope.entities = entities;
    }])
;