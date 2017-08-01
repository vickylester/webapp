'use strict';

angular.module('transcript.admin.entity.import', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.entity.import', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Entity/Import/Import.html',
                    controller: 'AdminEntityImportCtrl'
                }
            },
            url: '/import',
            ncyBreadcrumb: {
                parent: 'admin.entity.list',
                label: 'Importation'
            },
            resolve: {
                testators: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities('testators');
                }
            }
        })
    }])

    .controller('AdminEntityImportCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'testators', 'EntityService', 'flash', function($rootScope, $scope, $http, $sce, $state, testators, EntityService, flash) {
        $scope.form = {
            submit: {
                loading: false
            }
        };
        $scope.entity = {
            resources: [],
            will: {}
        };
        $scope.testators = testators;


        $scope.form.addResource = function(resourceNumber) {
            $scope.entity.resources.push({
                type: '',
                orderInWill: resourceNumber+1,
                images: '',
                notes: '',
                transcript: {
                    status: 'todo',
                    updateComment: 'Creation of the transcript'
                }
            });
        };

        $scope.form.submit.action = function() {
            console.log($scope.entity);
            $scope.form.submit.loading = true;

            if(typeof($scope.entity.will.testator) === "number") {
                postEntity();
            } else if(typeof($scope.entity.will.testator) === "object") {
                postTestator();
            }

            function postTestator() {
                return EntityService.postTestator($scope.entity.will.testator).then(function(data) {
                    $scope.entity.will.testator = data.id;
                    postEntity();
                }, function errorCallback(response) {
                    $scope.form.submit.loading = false;
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

            function postEntity() {
                for(let resource of $scope.entity.resources) {
                    resource.images = resource.images.split(",");
                }

                $scope.entity.will.title = "Testament "+$scope.entity.will.callNumber;
                $scope.entity.will.minuteDate = new Date($scope.entity.will.minuteDate);
                $scope.entity.will.willWritingDate = new Date($scope.entity.will.willWritingDate);

                return EntityService.postEntity($scope.entity).then(function(data) {
                    $scope.form.submit.loading = false;
                    $state.go('app.entity', {id: data.id});
                }, function errorCallback(response) {
                    $scope.form.submit.loading = false;
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