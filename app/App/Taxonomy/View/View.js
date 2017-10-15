'use strict';

angular.module('transcript.app.taxonomy.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.taxonomy.view', {
            views: {
                "page" : {
                    templateUrl: 'App/Taxonomy/View/View.html',
                    controller: 'AppTaxonomyViewCtrl'
                }
            },
            url: '/{type}/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.taxonomy.home',
                label: '{{ entity.name }}'
            },
            tfMetaTags: {
                title: '{{ entity.name }}',
            },
            resolve: {
                entity: function(TaxonomyService, $transition$) {
                    return TaxonomyService.getTaxonomyEntity($transition$.params().type, $transition$.params().id);
                },
                entities: function(TaxonomyService, $transition$) {
                    return TaxonomyService.getTaxonomyEntities($transition$.params().type);
                }
            }
        })
    }])

    .controller('AppTaxonomyViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'entity', 'entities', '$transition$', function($rootScope, $scope, $http, $sce, $state, $filter, entity, entities, $transition$) {
        $scope.entity = entity; console.log($scope.entity);
        $scope.entities = entities;
        $scope.entity.dataType = $transition$.params().type;

        /* -- Place name management ---------------------------------------------------------- */
        if($scope.entity.dataType === 'places') {
            if($scope.entity.names.length > 0) {
                $scope.entity.name = $scope.entity.names[0].name;
                console.log($scope.entity.name);
            }

            for(let iEntity in $scope.entities) {
                if($scope.entities[iEntity].names.length > 0) {
                    $scope.entities[iEntity].name = $scope.entities[iEntity].names[0].name;
                }
            }
        }
        if($scope.entity.dataType === 'testators') {
            if($scope.entity.placeOfBirth.names.length > 0) {
                $scope.entity.placeOfBirth.name = $scope.entity.placeOfBirth.names[0].name;
            }
            if($scope.entity.placeOfDeath.names.length > 0) {
                $scope.entity.placeOfDeath.name = $scope.entity.placeOfDeath.names[0].name;
            }
        }
        /* -- End : Place name management ---------------------------------------------------- */

        /* Entities sort management --------------------------------------------------------------------------------- */
        if($scope.entity.dataType === 'places') {
            $scope.entities = $filter('orderBy')($scope.entities, 'name');
        } else if($scope.entity.dataType === 'testators') {
            $scope.entities = $filter('orderBy')($scope.entities, 'surname');
        } else if($scope.entity.dataType === 'military-units') {
            $scope.entities = $filter('orderBy')($scope.entities, 'name');
        }
        /* End: Entities sort management ---------------------------------------------------------------------------- */

        /* -- Place's map management -------------------------------------------------------------------------------- */
        if($scope.entity.dataType === 'places' && $scope.entity.geographicalCoordinates !== null) {
            // Doc is here: http://tombatossals.github.io/angular-leaflet-directive/#!/examples/center
            let coord = $scope.entity.geographicalCoordinates.split('+');
            angular.extend($scope, {
                center: {
                    lat: parseFloat(coord[0]),
                    lng: parseFloat(coord[1]),
                    zoom: 7
                },
                markers: {
                    osloMarker: {
                        lat: parseFloat(coord[0]),
                        lng: parseFloat(coord[1]),
                        focus: true,
                        draggable: false
                    }
                },
                tiles: {
                    url: "http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                },
                defaults: {
                    scrollWheelZoom: false
                }
            });
        }
        /* -- End : Place's map management -------------------------------------------------------------------------- */

        /* -- Relative items management ------------------------------------------------------ */

        /* -- End : Relative items management ------------------------------------------------ */
    }])
;