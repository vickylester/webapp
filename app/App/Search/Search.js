'use strict';

angular.module('transcript.app.search', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.search', {
            views: {
                "page" : {
                    templateUrl: 'App/Search/Search.html',
                    controller: 'AppSearchCtrl'
                }
            },
            url: '/search',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Recherche'
            },
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities();
                }
            }
        })
    }])

    .service('SearchService', function($http, $rootScope, $sce, $filter) {
        return {
            search: function(entities, form) {
                console.log(form);
                // Deleting empty value in the form
                (function filter(obj) {
                    $.each(obj, function(key, value){
                        if (value === "" || value === null){
                            delete obj[key];
                        } else if (Object.prototype.toString.call(value) === '[object Object]') {
                            filter(value);
                        } else if ($.isArray(value)) {
                            $.each(value, function (k,v) { filter(v); });
                        }
                    });
                })(form);

                return $filter('filter') (entities, form, false);
            },
            dataset: function(entities, stringProperty, type) {
                // This function looks for value in deep object
                Object.byString = function(o, s) {
                    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
                    s = s.replace(/^\./, '');           // strip a leading dot
                    let a = s.split('.');
                    for (let i = 0, n = a.length; i < n; ++i) {
                        let k = a[i];
                        if (o[k] !== undefined) {
                            o = o[k];
                        } else {
                            return;
                        }
                    }
                    return o;
                };

                // Passing every entity though the function
                let dataset = [];
                for(let entity in entities) {
                    let value = Object.byString(entities[entity], stringProperty)
                    dataset.push({name: value, value: value});
                }

                // Removing not useful information for date
                if(type === "date") {
                    for(let obj in dataset) {
                        dataset[obj]['name'] = dataset[obj]['name'].substring(0,4);
                    }
                }

                // Filtering duplicates and returning data
                return dataset.filter((dataset, index, self) => self.findIndex((t) => {return t.name === dataset.name; }) === index);
            },
            filter: function(entities, filters) {
                let results = [];

                // Building an array of the filters allowed
                let filtersArray = {};
                for(let filter in filters) {
                    let filterArray = [];
                    for(let property in filters[filter]) {
                        if(filters[filter][property] === true) {
                            filterArray.push(property);
                        }
                    }
                    filtersArray[filter] = filterArray;
                }

                for(let filter in filtersArray) {
                    for(let entity in entities) {
                        if(filter === "status") {
                            if($.inArray(entities[entity]['_embedded']['status'], filtersArray[filter]) !== -1) {
                                results.push(entities[entity]);
                            }
                        }
                    }
                }
                return results;
            }
        };
    })

    .controller('AppSearchCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'entities', 'EntityService', 'SearchService', function($rootScope, $scope, $http, $sce, $state, flash, entities, EntityService, SearchService) {
        $scope.entities = entities;
        console.log($scope.entities);
        $scope.results = [];

        /* -- Definition of the fields --------------------------------------------------------------- */
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
                    },
                    hosting_organization: null,
                    will_writing_date: null,
                    call_number: null
                }
            },
            filters: {
                status: {
                    todo: true,
                    transcription: true,
                    validation: true,
                    validated: true
                }
            },
            values: {
                will: {
                    hosting_organization: [
                        {value: "AN", name: "Archives nationales"},
                        {value: "AD78", name: "Archives départementales des Yvelines"}
                    ],
                    testator: {
                        name: SearchService.dataset($scope.entities, "will.testator.name", "string"),
                        place_of_death: {
                            name: SearchService.dataset($scope.entities, "will.testator.place_of_death.name", "string")
                        },
                        date_of_death: SearchService.dataset($scope.entities, "will.testator.date_of_death", "date"),
                        place_of_birth: {
                            name: SearchService.dataset($scope.entities, "will.testator.place_of_birth.name", "string")
                        }
                    },
                    will_writing_date: SearchService.dataset($scope.entities, "will.will_writing_date", "date"),
                    // Call number is not here because it's not used as an autocompleted field
                    // Same for status
                }
            },
            result: {
                display: "list"
            }
        };
        /* -- End : Definition of the fields --------------------------------------------------------- */

        /* -- Fields watching ------------------------------------------------------------------------ */
        $scope.$watch('search.form.will.hosting_organization', function() {
            if($scope.search.form.will.hosting_organization !== undefined) {
                if ($scope.search.form.will.hosting_organization !== null && $scope.search.form.will.hosting_organization !== "" && $scope.search.form.will.hosting_organization.originalObject !== undefined) {
                    $scope.search.form.will.hosting_organization = $scope.search.form.will.hosting_organization.originalObject.value;
                    console.log($scope.search.form.will.hosting_organization);
                }
                refresh();
            }
        });

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

        $scope.$watch('search.form.will.will_writing_date', function() {
            if($scope.search.form.will.will_writing_date !== undefined) {
                if ($scope.search.form.will.will_writing_date !== null && $scope.search.form.will.will_writing_date !== "" && $scope.search.form.will.will_writing_date.originalObject !== undefined) {
                    $scope.search.form.will.will_writing_date = $scope.search.form.will.will_writing_date.originalObject.value;
                    console.log($scope.search.form.will.will_writing_date);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.call_number', function() {
            if($scope.search.form.will.call_number !== undefined) {
                if ($scope.search.form.will.call_number !== null && $scope.search.form.will.call_number !== "" && $scope.search.form.will.call_number.originalObject !== undefined) {
                    $scope.search.form.will.call_number = $scope.search.form.will.call_number.originalObject.value;
                    console.log($scope.search.form.will.call_number);
                }
                refresh();
            }
        });

        $scope.$watch('search.filters.status.todo', function() {
            refresh();
        });
        $scope.$watch('search.filters.status.transcription', function() {
            refresh();
        });
        $scope.$watch('search.filters.status.validation', function() {
            refresh();
        });
        $scope.$watch('search.filters.status.validated', function() {
            refresh();
        });
        /* -- End : Fields watching ------------------------------------------------------------------ */

        function refresh() {
            let toEntities = $scope.entities;
            let toForm = $scope.search.form;
            $scope.results = SearchService.filter(SearchService.search(toEntities, toForm), $scope.search.filters);
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
                osloMarker: {
                    lat: 49.9128,
                    lng: 3.7587,
                    message: "I want to travel here!",
                    focus: true,
                    draggable: false
                }
            },
            defaults: {
                scrollWheelZoom: false
            }
        });
        /* -- End : Setting up map ----------------------------------------------------------- */
    }])
;