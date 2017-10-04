'use strict';

angular.module('transcript.service.search', ['ui.router'])

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
                    let value = Object.byString(entities[entity], stringProperty);
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

;