'use strict';

angular.module('transcript.admin.taxonomy.logs', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.taxonomy.logs', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Taxonomy/Logs/Logs.html',
                    controller: 'AdminTaxonomyLogsCtrl'
                }
            },
            url: '/logs',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Historique des modifications'
            },
            tfMetaTags: {
                title: 'Historique des modifications',
            },
            resolve: {
                places: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities('places').then(function(data){
                        return data;
                    });
                },
                militaryUnits: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities('military-units').then(function(data){
                        return data;
                    });
                },
                testators: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities('testators').then(function(data){
                        return data;
                    });
                }
            }
        })
    }])

    .controller('AdminTaxonomyLogsCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'TaxonomyService', 'places', 'militaryUnits', 'testators', function($rootScope, $scope, $http, $sce, $state, TaxonomyService, places, militaryUnits, testators) {
        $scope.places = places;
        $scope.militaryUnits = militaryUnits;
        $scope.testators = testators;
        console.log(places);
        $scope.mixed = $scope.testators.concat($scope.militaryUnits, $scope.places);
    }])
;