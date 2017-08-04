'use strict';

angular.module('transcript.app.thesaurus.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.thesaurus.edit', {
            views: {
                "page" : {
                    templateUrl: 'App/Thesaurus/Edit/Edit.html',
                    controller: 'AppThesaurusEditCtrl'
                }
            },
            url: '/{type}/{id}/edit',
            ncyBreadcrumb: {
                parent: 'app.thesaurus.view({id: entity.edit})',
                label: 'Edition'
            },
            resolve: {
                entity: function(ThesaurusService, $transition$) {
                    return ThesaurusService.getThesaurusEntity($transition$.params().type, $transition$.params().id);
                },
                entities: function(ThesaurusService, $transition$) {
                    return ThesaurusService.getThesaurusEntities($transition$.params().type);
                },
                testators: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities('testators');
                },
                places: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities('places');
                },
                regiments: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities('regiments');
                }
            }
        })
    }])

    .controller('AppThesaurusEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'entities', 'ThesaurusService', '$transition$', 'flash', 'testators', 'places', 'regiments', function($rootScope, $scope, $http, $sce, $state, entity, entities, ThesaurusService, $transition$, flash, testators, places, regiments) {
        $scope.entity = entity;
        $scope.entity.dataType = $transition$.params().type;
        $scope.entity.update_comment = "";
        $scope.entities = entities;
        $scope.context = "edit";

        /**/
        $scope.testators = testators;
        $scope.places = places;
        $scope.regiments = regiments;

        $scope.submit = {
            loading: false
        };
        $scope.remove = {
            loading: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;

            $scope.form = fillForm($scope.entity, $scope.entity.dataType);
            patchEntity();

            function fillForm(data, type) {
                return ThesaurusService.getFormType(data, type);
            }

            function patchEntity() {
                return ThesaurusService.patchThesaurusEntity($scope.entity.dataType, $scope.entity.id, $scope.form).then(function(data) {
                    $scope.submit.loading = false;
                    $state.go('app.thesaurus.view', {type: $scope.entity.dataType, id: data.id});
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    if(response.data.code === 400) {
                        flash.error = "<ul>";
                        for(let field of response.data.errors.children) {
                            for(let error of field) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+error+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                        flash.error = $sce.trustAsHtml(flash.error);
                    }
                    console.log(response);
                });
            }
        };

        $scope.remove.action = function() {
            $scope.remove.loading = true;
            removeEntity();

            function removeEntity() {
                let dataType = $scope.entity.dataType;
                return ThesaurusService.removeThesaurusEntity($scope.entity.dataType, $scope.entity.id).then(function(data) {
                    $scope.remove.loading = false;
                    $state.go('app.thesaurus.list', {type: dataType});
                }, function errorCallback(response) {
                    $scope.remove.loading = false;
                    if(response.data.code === 400) {
                        flash.error = "<ul>";
                        for(let field of response.data.errors.children) {
                            for(let error of field) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+error+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                        flash.error = $sce.trustAsHtml(flash.error);
                    }
                    console.log(response);
                });
            }
        };
    }])
;