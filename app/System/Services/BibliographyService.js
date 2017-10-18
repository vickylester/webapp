'use strict';

angular.module('transcript.service.bibliography', ['ui.router'])

    .service('BibliographyService', function($http, $rootScope, $filter) {
        return {
            getBibliographies: function() {
                return $http.get($rootScope.api+"/reference-items"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getBibliographiesByEntity: function(id_entity) {
                return $http.get($rootScope.api+"/reference-items?entity="+id_entity
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getBibliography: function(id_reference) {
                return $http.get($rootScope.api+"/reference-items/"+id_reference
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            postBibliography: function(resource) {
                return $http.post($rootScope.api+"/reference-items", resource).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
        };
    })
;