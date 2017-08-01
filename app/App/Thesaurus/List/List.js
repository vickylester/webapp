'use strict';

angular.module('transcript.app.thesaurus.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.thesaurus.list', {
            views: {
                "page" : {
                    templateUrl: 'App/Thesaurus/List/List.html',
                    controller: 'AppThesaurusListCtrl'
                }
            },
            url: '/{type}',
            ncyBreadcrumb: {
                parent: 'app.thesaurus.home',
                label: 'Liste'
            },
            resolve: {
                entities: function(ThesaurusService, $transition$) {
                    return ThesaurusService.getThesaurusEntities($transition$.params().type);
                }
            }
        })
    }])

    .controller('AppThesaurusListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entities', '$transition$', function($rootScope, $scope, $http, $sce, $state, entities, $transition$) {
        $scope.entity = {
            id: null,
            dataType: $transition$.params().type
        };
        $scope.entities = entities;
        console.log($scope.entities);
    }])
;