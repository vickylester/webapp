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
                label: 'Accueil'
            },
            tfMetaTags: {
                title: 'Accueil',
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

        for(let iEntity in $scope.entities) {
            if($scope.entities[iEntity].will.testator.placeOfBirth !== null && $scope.entities[iEntity].will.testator.placeOfBirth.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfBirth.name = $scope.entities[iEntity].will.testator.placeOfBirth.names[0].name;
            }
            if($scope.entities[iEntity].will.testator.placeOfDeath.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfDeath.name = $scope.entities[iEntity].will.testator.placeOfDeath.names[0].name;
            }
        }

        /* -- Search interface ------------------------------------------------ */
        /* -- Definition of the fields --------------------------------------------------------------- */
        $scope.results = [];
        $scope.search = {
            form: {
                will: {
                    testator: {
                        name: null,
                        placeOfDeath: {
                            names: null
                        },
                        yearOfDeath: null,
                        placeOfBirth: {
                            names: null
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
                        yearOfDeath: SearchService.dataset($scope.entities, "will.testator.yearOfDeath", "string"),
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

        $scope.$watch('search.form.will.testator.yearOfDeath', function() {
            if($scope.search.form.will.testator.yearOfDeath !== undefined) {
                if ($scope.search.form.will.testator.yearOfDeath !== null && $scope.search.form.will.testator.yearOfDeath !== "" && $scope.search.form.will.testator.yearOfDeath.originalObject !== undefined) {
                    $scope.search.form.will.testator.yearOfDeath = $scope.search.form.will.testator.yearOfDeath.originalObject.value;
                    console.log($scope.search.form.will.testator.yearOfDeath);
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
                url: "http://a.tile.openstreetmap.fr/{z}/{x}/{y}.png"
            },
            markers: {

            },
            defaults: {
                scrollWheelZoom: false
            },
            legend: {
                position: 'bottomleft',
                colors: [ '#000000' ],
                labels: [ 'Lieux de décès' ]
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