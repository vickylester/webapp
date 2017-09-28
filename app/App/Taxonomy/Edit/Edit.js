'use strict';

angular.module('transcript.app.taxonomy.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.app.taxonomy.edit', {
                views: {
                    "page" : {
                        templateUrl: 'App/Taxonomy/Edit/Edit.html',
                        controller: 'AppTaxonomyEditCtrl'
                    }
                },
                url: '/{type}/{id}/edit',
                ncyBreadcrumb: {
                    parent: 'transcript.app.taxonomy.view({type: entity.dataType, id: entity.id})',
                    label: 'Edition'
                },
                resolve: {
                    entity: function(TaxonomyService, $transition$) {
                        return TaxonomyService.getTaxonomyEntity($transition$.params().type, $transition$.params().id);
                    },
                    entities: function(TaxonomyService, $transition$) {
                        return TaxonomyService.getTaxonomyEntities($transition$.params().type);
                    },
                    testators: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('testators');
                    },
                    places: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('places');
                    },
                    regiments: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('regiments');
                    }
                }
            })
            .state('app.taxonomy.create', {
                views: {
                    "page" : {
                        templateUrl: 'App/Taxonomy/Edit/Edit.html',
                        controller: 'AppTaxonomyEditCtrl'
                    }
                },
                url: '/{type}/new',
                ncyBreadcrumb: {
                    parent: 'app.taxonomy.home',
                    label: 'Nouveau'
                },
                resolve: {
                    entity: function() {
                        return null;
                    },
                    entities: function(TaxonomyService, $transition$) {
                        return TaxonomyService.getTaxonomyEntities($transition$.params().type);
                    },
                    testators: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('testators');
                    },
                    places: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('places');
                    },
                    regiments: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('regiments');
                    }
                }
            })
    }])

    .controller('AppTaxonomyEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'entities', 'TaxonomyService', '$transition$', 'flash', 'testators', 'places', 'regiments', 'GeonamesService', '$filter', function($rootScope, $scope, $http, $sce, $state, entity, entities, TaxonomyService, $transition$, flash, testators, places, regiments, GeonamesService, $filter) {
        if($filter('contains')($rootScope.user.roles, "ROLE_TAXONOMY_EDIT") === false) {$state.go('transcript.error.403');}

        /* -- Functions Loader ----------------------------------------------------- */
        function patchEntityLoader() {
            $scope.form = fillForm($scope.entity, $scope.entity.dataType);
            patchEntity();

            function fillForm(data, type) {
                return TaxonomyService.getFormType(data, type);
            }

            function patchEntity() {
                return TaxonomyService.patchTaxonomyEntity($scope.entity.dataType, $scope.entity.id, $scope.form).then(function(data) {
                    $scope.submit.loading = false;
                    $state.go('transcript.app.taxonomy.view', {type: $scope.entity.dataType, id: data.id});
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
                return TaxonomyService.getFormType(data, type);
            }

            function postEntity() {
                return TaxonomyService.postTaxonomyEntity($scope.entity.dataType, $scope.form).then(function(data) {
                    $scope.submit.loading = false;
                    $state.go('transcript.app.taxonomy.view', {type: $scope.entity.dataType, id: data.id});
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
            $scope.entity.updateComment = "";
            $scope.context = "edit";

            $scope.remove = {
                loading: false
            };

            $scope.remove.action = function() {
                $scope.remove.loading = true;
                removeEntity();

                function removeEntity() {
                    let dataType = $scope.entity.dataType;
                    return TaxonomyService.removeTaxonomyEntity($scope.entity.dataType, $scope.entity.id).then(function(data) {
                        $scope.remove.loading = false;
                        $state.go('transcript.app.taxonomy.list', {type: dataType});
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