'use strict';

angular.module('transcript.app.thesaurus.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.thesaurus.view', {
            views: {
                "page" : {
                    templateUrl: 'App/Thesaurus/View/View.html',
                    controller: 'AppThesaurusViewCtrl'
                }
            },
            url: '/{type}/{id}',
            ncyBreadcrumb: {
                parent: 'app.thesaurus.home',
                label: '{{ entity.name }}'
            },
            resolve: {
                entity: function(ThesaurusService, $transition$) {
                    return ThesaurusService.getThesaurusEntity($transition$.params().type, $transition$.params().id);
                },
                entities: function(ThesaurusService, $transition$) {
                    return ThesaurusService.getThesaurusEntities($transition$.params().type);
                }
            }
        })
    }])

    .controller('AppThesaurusViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'entities', '$transition$', function($rootScope, $scope, $http, $sce, $state, entity, entities, $transition$) {
        $scope.entity = entity;
        $scope.entities = entities;
        $scope.entity.dataType = $transition$.params().type;
    }])
;