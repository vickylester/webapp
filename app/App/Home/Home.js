'use strict';

angular.module('transcript.app.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.home', {
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
                        placeOfDeath: {
                            name: null
                        },
                        dateOfDeath: null,
                        placeOfBirth: {
                            name: null
                        }
                    }
                }
            },
            values: {
                will: {
                    testator: {
                        name: SearchService.dataset($scope.entities, "will.testator.name", "string"),
                        placeOfDeath: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfDeath.name", "string")
                        },
                        dateOfDeath: SearchService.dataset($scope.entities, "will.testator.dateOfDeath", "date"),
                        placeOfBirth: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfBirth.name", "string")
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

        $scope.$watch('search.form.will.testator.placeOfDeath.name', function() {
            if($scope.search.form.will.testator.placeOfDeath.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfDeath.name !== null && $scope.search.form.will.testator.placeOfDeath.name !== "" && $scope.search.form.will.testator.placeOfDeath.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfDeath.name = $scope.search.form.will.testator.placeOfDeath.name.originalObject.value;
                    console.log($scope.search.form.will.testator.placeOfDeath.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.dateOfDeath', function() {
            if($scope.search.form.will.testator.dateOfDeath !== undefined) {
                if ($scope.search.form.will.testator.dateOfDeath !== null && $scope.search.form.will.testator.dateOfDeath !== "" && $scope.search.form.will.testator.dateOfDeath.originalObject !== undefined) {
                    $scope.search.form.will.testator.dateOfDeath = $scope.search.form.will.testator.dateOfDeath.originalObject.value;
                    console.log($scope.search.form.will.testator.dateOfDeath);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.placeOfBirth.name', function() {
            if($scope.search.form.will.testator.placeOfBirth.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfBirth.name !== null && $scope.search.form.will.testator.placeOfBirth.name !== "" && $scope.search.form.will.testator.placeOfBirth.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfBirth.name = $scope.search.form.will.testator.placeOfBirth.name.originalObject.value;
                    console.log($scope.search.form.will.testator.placeOfBirth.name);
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

                if(entity.will.testator.placeOfDeath !== null && entity.will.testator.placeOfDeath.geographicalCoordinates !== null) {
                    let coord = entity.will.testator.placeOfDeath.geographicalCoordinates.split('+');
                    let id = "maker"+entity.will.testator.id;
                    let marker = {
                        lat: parseFloat(coord[0]),
                        lng: parseFloat(coord[1]),
                        message: entity.will.testator.name+' décédé à '+entity.will.testator.placeOfDeath.name,
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