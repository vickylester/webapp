'use strict';

angular.module('transcript.app.taxonomy.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.taxonomy.list', {
            views: {
                "page" : {
                    templateUrl: 'App/Taxonomy/List/List.html',
                    controller: 'AppTaxonomyListCtrl'
                }
            },
            url: '/{type}',
            ncyBreadcrumb: {
                parent: 'app.taxonomy.home',
                label: 'Liste des {{ entity.dataType }}'
            },
            resolve: {
                entities: function(TaxonomyService, $transition$) {
                    return TaxonomyService.getTaxonomyEntities($transition$.params().type);
                }
            }
        })
    }])

    .controller('AppTaxonomyListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entities', '$transition$', function($rootScope, $scope, $http, $sce, $state, entities, $transition$) {
        $scope.entity = {
            id: null,
            dataType: $transition$.params().type
        };
        $scope.entities = entities;
        console.log($scope.entities);
    }])
;