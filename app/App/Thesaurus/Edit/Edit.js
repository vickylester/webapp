'use strict';

angular.module('transcript.app.thesaurus.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('app.thesaurus.edit', {
                views: {
                    "page" : {
                        templateUrl: 'App/Thesaurus/Edit/Edit.html',
                        controller: 'AppThesaurusEditCtrl'
                    }
                },
                url: '/{type}/{id}/edit',
                ncyBreadcrumb: {
                    parent: 'app.thesaurus.view({type: entity.dataType, id: entity.id})',
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
            .state('app.thesaurus.create', {
                views: {
                    "page" : {
                        templateUrl: 'App/Thesaurus/Edit/Edit.html',
                        controller: 'AppThesaurusEditCtrl'
                    }
                },
                url: '/{type}/new',
                ncyBreadcrumb: {
                    parent: 'app.thesaurus.home',
                    label: 'Nouveau'
                },
                resolve: {
                    entity: function() {
                        return null;
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

    .controller('AppThesaurusEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'entities', 'ThesaurusService', '$transition$', 'flash', 'testators', 'places', 'regiments', 'GeonamesService', '$filter', function($rootScope, $scope, $http, $sce, $state, entity, entities, ThesaurusService, $transition$, flash, testators, places, regiments, GeonamesService, $filter) {
        if($filter('contains')($rootScope.user.roles, "ROLE_THESAURUS_EDIT") === false) {$state.go('error.403');}

        /* -- Functions Loader ----------------------------------------------------- */
        function patchEntityLoader() {
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
        }
        function postEntityLoader() {
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
        /* -- End : Functions Loader ------------------------------------------------ */

        /* -- Scope management ------------------------------------------------------ */
        $scope.testators = testators;
        $scope.places = places;
        $scope.regiments = regiments;
        $scope.entities = entities;

        $scope.submit = {
            loading: false
        };
        /* -- End : Scope management ------------------------------------------------- */

        if(entity === null) {
            // Creation of a new entity
            $scope.entity = {
                dataType : $transition$.params().type
            };
            $scope.context = "create";
        } else {
            // Edition of entity
            $scope.entity = entity;
            $scope.entity.dataType = $transition$.params().type;
            $scope.entity.update_comment = "";
            $scope.context = "edit";

            $scope.remove = {
                loading: false
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
        }

        $scope.submit.action = function() {
            $scope.submit.loading = true;

            if(entity === null) {
                postEntityLoader();
            } else {
                patchEntityLoader();
            }
        };

        /* -- Geonames management ------------------------------------------------------------------ */
        $scope.geonames = {
            keywords: null,
            loading: false,
            result: null
        };

        $scope.geonames.action = function() {
            $scope.geonames.loading = true;
            requestGeonames();

            function requestGeonames() {
                return GeonamesService.search($scope.geonames.keywords).then(function(data) {
                    $scope.geonames.loading = false;
                    console.log(data);
                    $scope.geonames.result = data;
                }, function errorCallback(response) {
                    $scope.geonames.loading = false;
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
        /* -- End Geonames management -------------------------------------------------------------- */
    }])
;