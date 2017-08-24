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

    .controller('AdminEntityImportCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'testators', 'places', 'regiments', 'EntityService', 'ThesaurusService', 'flash', function($rootScope, $scope, $http, $sce, $state, testators, places, regiments, EntityService, ThesaurusService, flash) {
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
        $scope.places = places;
        $scope.regiments = regiments;


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

            if(typeof($scope.entity.will.testator) === "object") {
                postTestatorStarter();
            }
            if(typeof($scope.entity.will.willWritingPlace) === "object") {
                postPlace($scope.entity.will.willWritingPlace, 'willWritingPlace');
            }
            if(typeof($scope.entity.will.willWritingPlace) === "number" && typeof($scope.entity.will.testator) === "number") {
                postEntityStarter();
            }

            function postEntityStarter() {
                console.log('postEntityStarter');
                if (typeof($scope.entity.will.testator) === "number" && typeof($scope.entity.will.willWritingPlace) === "number") {
                    postEntity();
                }
            }

            function postPlace(entity, entityName) {
                console.log('postPlace');
                return ThesaurusService.postThesaurusEntity('places',
                    {
                        name: entity.name,
                        updateComment: 'Creation of '+entity.name
                    }
                ).then(function(data) {
                    if(entityName === "willWritingPlace") {
                        $scope.entity.will.willWritingPlace = data.id;
                        postEntityStarter();
                    } else if(entityName === "testator.placeOfDeath") {
                        $scope.entity.will.testator.placeOfDeath = data.id;
                        postTestatorStarter();
                    } else if(entityName === "testator.placeOfBirth") {
                        $scope.entity.will.testator.placeOfBirth = data.id;
                        postTestatorStarter();
                    }
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

            function postRegiment(entity, entityName) {
                console.log('postRegiment');
                return ThesaurusService.postThesaurusEntity('regiments',
                    {
                        name: entity.name,
                        updateComment: 'Creation of '+entity.name
                    }
                ).then(function(data) {
                    if(entityName === "testator.regiment") {
                        $scope.entity.will.testator.regiment = data.id;
                        postTestatorStarter();
                    }
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

            function postTestatorStarter() {
                console.log('postTestatorStarter');
                if(typeof($scope.entity.will.testator.placeOfDeath) === "number" && typeof($scope.entity.will.testator.placeOfBirth) === "number"  && typeof($scope.entity.will.testator.regiment) === "number") {
                    postTestator();
                }
                else {
                    if(typeof($scope.entity.will.testator.placeOfDeath) === "object") {
                        postPlace($scope.entity.will.testator.placeOfDeath, 'testator.placeOfDeath');
                    }

                    if(typeof($scope.entity.will.testator.placeOfBirth) === "object") {
                        postPlace($scope.entity.will.testator.placeOfBirth, 'testator.placeOfBirth');
                    }

                    if(typeof($scope.entity.will.testator.regiment) === "object") {
                        postRegiment($scope.entity.will.testator.regiment, 'testator.regiment');
                    }
                }
            }

            function postTestator() {
                console.log('postTestator');
                $scope.entity.will.testator.updateComment = "Creation of the entity";
                return ThesaurusService.postThesaurusEntity('testators', $scope.entity.will.testator).then(function(data) {
                    $scope.entity.will.testator = data.id;
                    postEntityStarter();
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
                console.log('postEntity');
                for(let resource of $scope.entity.resources) {
                    resource.images = resource.images.split(",");
                }

                // Rewriting of special fields
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