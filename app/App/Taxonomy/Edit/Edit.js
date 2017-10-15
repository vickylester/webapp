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
                    label: 'Modification'
                },
                tfMetaTags: {
                    title: 'Modification de {{ entity.name }}',
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
                    militaryUnits: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('military-units');
                    }
                }
            })
            .state('transcript.app.taxonomy.create', {
                views: {
                    "page" : {
                        templateUrl: 'App/Taxonomy/Edit/Edit.html',
                        controller: 'AppTaxonomyEditCtrl'
                    }
                },
                url: '/{type}/new',
                ncyBreadcrumb: {
                    parent: 'transcript.app.taxonomy.home',
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
                    militaryUnits: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('military-units');
                    }
                }
            })
    }])

    .controller('AppTaxonomyEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'entities', 'TaxonomyService', '$transition$', 'flash', 'testators', 'places', 'militaryUnits', 'GeonamesService', '$filter', function($rootScope, $scope, $http, $sce, $state, entity, entities, TaxonomyService, $transition$, flash, testators, places, militaryUnits, GeonamesService, $filter) {
        if(($filter('contains')($rootScope.user.roles, "ROLE_TAXONOMY_EDIT") === false && ($rootScope.preferences.taxonomyEditAccess === 'selfAuthorization' || $rootScope.preferences.taxonomyEditAccess === 'controlledAuthorization')) || $rootScope.preferences.taxonomyEditAccess === 'forbidden') {$state.go('transcript.error.403');}

        /* -- Functions Loader -------------------------------------------------------------------------------------- */
        function patchEntityLoader(entity, dataType) {
            $scope.form = fillForm(entity, dataType);
            patchEntity();

            function fillForm(data, type) {
                return TaxonomyService.getFormType(data, type);
            }

            function patchEntity() {
                return TaxonomyService.patchTaxonomyEntity(dataType, entity.id, $scope.form).then(function(data) {
                    $scope.submit.loading = false;
                    $state.go('transcript.app.taxonomy.view', {type: dataType, id: data.id});
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
        function postEntityLoader(entity, dataType, action) {
            $scope.form = fillForm(entity, dataType);
            $scope.form.updateComment = "Creation of the entity";
            console.log($scope.form);
            postEntity();

            function fillForm(data, type) {
                return TaxonomyService.getFormType(data, type);
            }

            function postEntity() {
                return TaxonomyService.postTaxonomyEntity(dataType, $scope.form).then(function(data) {
                    $scope.submit.loading = false;
                    if(action === "redirect") {
                        $state.go('transcript.app.taxonomy.view', {type: dataType, id: data.id});
                    } else if(action === "reloadPlaces") {
                        $scope.form = null;
                        return TaxonomyService.getTaxonomyEntities("places").then(function(data) {
                            $scope.places = data;
                        });
                    }
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
        /* -- End : Functions Loader -------------------------------------------------------------------------------- */

        /* -- Scope management -------------------------------------------------------------------------------------- */
        $scope.testators = $filter('orderBy')(testators, 'surname');
        $scope.places = places;
        $scope.militaryUnits = $filter('orderBy')(militaryUnits, 'name');
        $scope.entities = entities;

        $scope.submit = {
            loading: false
        };
        /* -- End : Scope management -------------------------------------------------------------------------------- */

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

        /* -- Place name management --------------------------------------------------------------------------------- */
        if($scope.entity.dataType === 'places' && $scope.entity.id !== undefined) {
            if($scope.entity.names.length > 0) {
                $scope.entity.name = $scope.entity.names[0].name;
                console.log($scope.entity.name);
            }
        }

        if($scope.entity.dataType === 'places') {
            for(let iEntity in $scope.entities) {
                if($scope.entities[iEntity].names.length > 0) {
                    $scope.entities[iEntity].name = $scope.entities[iEntity].names[0].name;
                }
            }
        }

        for(let iEntity in $scope.places) {
            if($scope.places[iEntity].names.length > 0) {
                $scope.places[iEntity].name = $scope.places[iEntity].names[0].name;
            }
        }
        $scope.places = $filter('orderBy')($scope.places, 'name');

        function parsePlaceNames() {
            if($scope.entity.name !== undefined && $scope.entity.name !== null) {
                $scope.entity.names = [{name: $scope.entity.name, updateComment: "entity creation"}];
            } else {$scope.entity.name = null;}
            if($scope.entity.frenchDepartement !== undefined && $scope.entity.frenchDepartement !== null) {
                $scope.entity.frenchDepartements = [{name: $scope.entity.frenchDepartement, updateComment: "entity creation"}];
            } else {$scope.entity.frenchDepartement = null;}
            if($scope.entity.frenchRegion !== undefined && $scope.entity.frenchRegion !== null) {
                $scope.entity.frenchRegions = [{name: $scope.entity.frenchRegion, updateComment: "entity creation"}];
            } else {$scope.entity.frenchRegion = null;}
            if($scope.entity.country !== undefined && $scope.entity.country !== null) {
                $scope.entity.countries = [{name: $scope.entity.country, updateComment: "entity creation"}];
            } else {$scope.entity.country = null;}
            if($scope.entity.city !== undefined && $scope.entity.city !== null) {
                $scope.entity.cities = [{name: $scope.entity.city, updateComment: "entity creation"}];
            } else {$scope.entity.city = null;}
            console.log($scope.entity);
        }
        /* -- End : Place name management --------------------------------------------------------------------------- */

        /* Entities sort management --------------------------------------------------------------------------------- */
        if($scope.entity.dataType === 'places') {
            $scope.entities = $filter('orderBy')($scope.entities, 'name');
        } else if($scope.entity.dataType === 'testators') {
            $scope.entities = $filter('orderBy')($scope.entities, 'surname');
        } else if($scope.entity.dataType === 'military-units') {
            $scope.entities = $filter('orderBy')($scope.entities, 'name');
        }
        /* End: Entities sort management ---------------------------------------------------------------------------- */

        /* -- Action management ------------------------------------------------------------------------------------- */
        $scope.submit.action = function() {
            $scope.submit.loading = true;

            if($scope.entity.dataType === "places") {parsePlaceNames();}
            console.log($scope.entity);

            if(entity === null) {
                postEntityLoader($scope.entity, $scope.entity.dataType, "redirect");
            } else {
                patchEntityLoader($scope.entity, $scope.entity.dataType);
            }
        };
        /* -- End Action management --------------------------------------------------------------------------------- */

        /* -- Mémoire des Hommes management ------------------------------------------------------------------------- */
        if($scope.entity.dataType === 'testators' && $scope.entity.id !== undefined) {
            $scope.entity.memoireDesHommes = $scope.entity.memoireDesHommes.join(', ');
        }
        /* -- End: Mémoire des Hommes management--------------------------------------------------------------------- */

        /* -- Geonames management ----------------------------------------------------------------------------------- */
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
        /* -- End Geonames management ------------------------------------------------------------------------------- */
    }])
;