'use strict';

angular.module('transcript.admin.thesaurus.logs', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.thesaurus.logs', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Thesaurus/Logs/Logs.html',
                    controller: 'AdminThesaurusLogsCtrl'
                }
            },
            url: '/logs',
            ncyBreadcrumb: {
                parent: 'admin.home',
                label: 'Historique des modifications'
            },
            resolve: {
                places: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities('places').then(function(data){
                        return data;
                    });
                },
                regiments: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities('regiments').then(function(data){
                        return data;
                    });
                },
                testators: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities('testators').then(function(data){
                        return data;
                    });
                }
            }
        })
    }])

    .controller('AdminThesaurusLogsCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'ThesaurusService', 'places', 'regiments', 'testators', function($rootScope, $scope, $http, $sce, $state, ThesaurusService, places, regiments, testators) {
        $scope.places = places;
        $scope.regiments = regiments;
        $scope.testators = testators;
        console.log(places);
        $scope.mixed = $scope.testators.concat($scope.regiments, $scope.places);
    }])
;