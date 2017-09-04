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
            resolve: {
                places: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities('places').then(function(data){
                        return data;
                    });
                },
                regiments: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities('regiments').then(function(data){
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

    .controller('AdminTaxonomyLogsCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'TaxonomyService', 'places', 'regiments', 'testators', function($rootScope, $scope, $http, $sce, $state, TaxonomyService, places, regiments, testators) {
        $scope.places = places;
        $scope.regiments = regiments;
        $scope.testators = testators;
        console.log(places);
        $scope.mixed = $scope.testators.concat($scope.regiments, $scope.places);
    }])
;