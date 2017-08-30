'use strict';

angular.module('transcript.app.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.home', {
            views: {
                "page" : {
                    templateUrl: 'App/Home/Home.html',
                    controller: 'AppHomeCtrl'
                }
            },
            ncyBreadcrumb: {
                label: 'Home'
            },
            url: '/',
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities();
                },
                contents: function(ContentService) {
                    return ContentService.getContents("blogContent", "public", "DESC", 10, 0);
                },
                staticContents: function(ContentService) {
                    return ContentService.getContents("staticContent", "public", "DESC", 10, 1);
                },
            }
        })
    }])

    .controller('AppHomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entities', 'contents', 'staticContents', 'SearchService', 'EntityService', function($rootScope, $scope, $http, $sce, $state, entities, contents, staticContents, SearchService, EntityService) {
        $scope.entities = entities;
        $scope.contents = contents;
        $scope.staticContents = staticContents;


        /* -- Search interface ------------------------------------------------ */
        /* -- Definition of the fields --------------------------------------------------------------- */
        $scope.results = [];
        $scope.search = {
            form: {
                will: {
                    testator: {
                        name: null,
                        place_of_death: {
                            name: null
                        },
                        date_of_death: null,
                        place_of_birth: {
                            name: null
                        }
                    }
                }
            },
            values: {
                will: {
                    testator: {
                        name: SearchService.dataset($scope.entities, "will.testator.name", "string"),
                        place_of_death: {
                            name: SearchService.dataset($scope.entities, "will.testator.place_of_death.name", "string")
                        },
                        date_of_death: SearchService.dataset($scope.entities, "will.testator.date_of_death", "date"),
                        place_of_birth: {
                            name: SearchService.dataset($scope.entities, "will.testator.place_of_birth.name", "string")
                        }
                    }
                }
            }
        };
        /* -- End : Definition of the fields --------------------------------------------------------- */

        /* -- Fields watching ------------------------------------------------------------------------ */
        $scope.$watch('search.form.will.testator.name', function() {
            if($scope.search.form.will.testator.name !== undefined) {
                if ($scope.search.form.will.testator.name !== null && $scope.search.form.will.testator.name !== ""&& $scope.search.form.will.testator.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.name = $scope.search.form.will.testator.name.originalObject.value;
                    console.log($scope.search.form.will.testator.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.place_of_death.name', function() {
            if($scope.search.form.will.testator.place_of_death.name !== undefined) {
                if ($scope.search.form.will.testator.place_of_death.name !== null && $scope.search.form.will.testator.place_of_death.name !== "" && $scope.search.form.will.testator.place_of_death.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.place_of_death.name = $scope.search.form.will.testator.place_of_death.name.originalObject.value;
                    console.log($scope.search.form.will.testator.place_of_death.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.date_of_death', function() {
            if($scope.search.form.will.testator.date_of_death !== undefined) {
                if ($scope.search.form.will.testator.date_of_death !== null && $scope.search.form.will.testator.date_of_death !== "" && $scope.search.form.will.testator.date_of_death.originalObject !== undefined) {
                    $scope.search.form.will.testator.date_of_death = $scope.search.form.will.testator.date_of_death.originalObject.value;
                    console.log($scope.search.form.will.testator.date_of_death);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.place_of_birth.name', function() {
            if($scope.search.form.will.testator.place_of_birth.name !== undefined) {
                if ($scope.search.form.will.testator.place_of_birth.name !== null && $scope.search.form.will.testator.place_of_birth.name !== "" && $scope.search.form.will.testator.place_of_birth.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.place_of_birth.name = $scope.search.form.will.testator.place_of_birth.name.originalObject.value;
                    console.log($scope.search.form.will.testator.place_of_birth.name);
                }
                refresh();
            }
        });
        /* -- End : Fields watching ------------------------------------------------------------------ */

        function refresh() {
            let toEntities = $scope.entities;
            let toForm = $scope.search.form;
            $scope.results = SearchService.search(toEntities, toForm);
            setMarkers();
        }

        /* -- Setting up map ----------------------------------------------------------------- */
        // Doc is here: http://tombatossals.github.io/angular-leaflet-directive/#!/examples/center
        angular.extend($scope, {
            center: {
                lat: 49.9128,
                lng: 3.7587,
                zoom: 6
            },
            tiles: {
                url: "http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            },
            markers: {

            },
            defaults: {
                scrollWheelZoom: false
            }
        });

        function setMarkers() {
            let markers = {};
            for(let result in $scope.results) {
                let entity = $scope.results[result];

                if(entity.will.testator.place_of_death !== null && entity.will.testator.place_of_death.geographical_coordinates !== null) {
                    let coord = entity.will.testator.place_of_death.geographical_coordinates.split('+');
                    let id = "maker"+entity.will.testator.id;
                    let marker = {
                        lat: parseFloat(coord[0]),
                        lng: parseFloat(coord[1]),
                        message: entity.will.testator.name+' décédé à '+entity.will.testator.place_of_death.name,
                        focus: false,
                        draggable: false
                    };
                    markers[id] = marker;
                }
            }
            $scope.markers = markers;
        }
        /* -- End : Setting up map ----------------------------------------------------------- */
        /* -- Search interface ------------------------------------------------ */
    }])
;