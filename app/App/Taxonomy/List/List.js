'use strict';

angular.module('transcript.app.taxonomy.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.taxonomy.list', {
            views: {
                "page" : {
                    templateUrl: 'App/Taxonomy/List/List.html',
                    controller: 'AppTaxonomyListCtrl'
                }
            },
            url: '/{type}',
            ncyBreadcrumb: {
                parent: 'transcript.app.taxonomy.home',
                label: 'Liste des {{ pluralType }}'
            },
            tfMetaTags: {
                title: 'Liste des {{ pluralType }}'
            },
            resolve: {
                entities: function(TaxonomyService, $transition$) {
                    return TaxonomyService.getTaxonomyEntities($transition$.params().type);
                }
            }
        })
    }])

    .controller('AppTaxonomyListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entities', '$transition$', '$filter', function($rootScope, $scope, $http, $sce, $state, entities, $transition$, $filter) {
        $scope.entity = {
            id: null,
            dataType: $transition$.params().type
        };
        $scope.entities = entities;
        console.log($scope.entities);

        $scope.pluralType = $filter('taxonomyName')($scope.entity.dataType, 'plural');

        if($scope.entity.dataType === 'places') {
            for(let iEntity in $scope.entities) {
                if($scope.entities[iEntity].names.length > 0) {
                    $scope.entities[iEntity].name = $scope.entities[iEntity].names[0].name;
                }
            }
        }
    }])
;