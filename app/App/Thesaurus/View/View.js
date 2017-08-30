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