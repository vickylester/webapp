'use strict';

angular.module('transcript.app.taxonomy.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.taxonomy.view', {
            views: {
                "page" : {
                    templateUrl: 'App/Taxonomy/View/View.html',
                    controller: 'AppTaxonomyViewCtrl'
                }
            },
            url: '/{type}/{id}',
            ncyBreadcrumb: {
                parent: 'app.taxonomy.home',
                label: '{{ entity.name }}'
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

    .controller('AppTaxonomyViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'entities', '$transition$', function($rootScope, $scope, $http, $sce, $state, entity, entities, $transition$) {
        $scope.entity = entity;
        $scope.entities = entities;
        $scope.entity.dataType = $transition$.params().type;

        if($scope.entity.dataType === 'places' && $scope.entity.geographical_coordinates !== null) {
            /* -- Setting up map ----------------------------------------------------------------- */
            // Doc is here: http://tombatossals.github.io/angular-leaflet-directive/#!/examples/center
            let coord = $scope.entity.geographical_coordinates.split('+');
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
            /* -- End : Setting up map ----------------------------------------------------------- */
        }

        /* -- Relative items management ------------------------------------------------------ */

        /* -- End : Relative items management ------------------------------------------------ */
    }])
;