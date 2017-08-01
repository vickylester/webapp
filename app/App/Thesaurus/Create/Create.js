'use strict';

angular.module('transcript.app.thesaurus.create', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.thesaurus.create', {
            views: {
                "page" : {
                    templateUrl: 'App/Thesaurus/Create/Create.html',
                    controller: 'AppThesaurusCreateCtrl'
                }
            },
            url: '/{type}/new',
            ncyBreadcrumb: {
                parent: 'app.thesaurus.home',
                label: 'Nouveau'
            },
            resolve: {
                entities: function(ThesaurusService, $transition$) {
                    return ThesaurusService.getThesaurusEntities($transition$.params().type);
                }
            }
        })
    }])

    .controller('AppThesaurusCreateCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entities', 'ThesaurusService', '$transition$', 'flash', function($rootScope, $scope, $http, $sce, $state, entities, ThesaurusService, $transition$, flash) {
        $scope.entity = {
            dataType : $transition$.params().type
        };
        $scope.entities = entities;
        $scope.context = "create";

        $scope.submit = {
            loading: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;

            $scope.form = fillForm($scope.entity, $scope.entity.dataType);
            $scope.form.updateComment = "Creation of the entity";
            postEntity();

            function fillForm(data, type) {
                return ThesaurusService.getFormType(data, type);
            }

            function postEntity() {
                return ThesaurusService.postThesaurusEntity($scope.entity.dataType, $scope.form).then(function(data) {
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
        }
    }])
;