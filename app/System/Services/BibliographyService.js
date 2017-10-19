'use strict';

angular.module('transcript.service.bibliography', ['ui.router'])

    .service('BibliographyService', function($http, $rootScope, $filter) {
        let BS = this;
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

            postBibliography: function(entity, reference, type) {
                if(type === "manuscriptReference") {
                    return BS.postManuscriptReference(entity).then(function(data) {
                        let item = {
                            entity: entity.id,
                            manuscriptItem: data.id
                        };
                        return BS.postReferenceItem(item).then(function(RData) {
                            return RData;
                        });
                    });
                } else if(type === "printedReference") {
                    return BS.postPrintedReference(entity).then(function(data) {
                        let item = {
                            entity: entity.id,
                            printedItem: data.id
                        };
                        return BS.postReferenceItem(item).then(function(RData) {
                            return RData;
                        });
                    });
                }
            },

            postManuscriptReference: function(data) {
                return $http.post($rootScope.api+"/manuscript-references", data).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            postPrintedReference: function(data) {
                return $http.post($rootScope.api+"/printed-references", data).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            postReferenceItem: function(data) {
                return $http.post($rootScope.api+"/reference-items", data).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            }
        };
    })
;