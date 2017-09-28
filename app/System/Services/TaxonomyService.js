'use strict';

angular.module('transcript.service.taxonomy', ['ui.router'])

    .service('TaxonomyService', function($http, $rootScope) {
        return {
            getTaxonomyEntities: function(type) {
                return $http.get(
                    $rootScope.api+"/"+type
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getTaxonomyEntity: function(type, id) {
                return $http.get(
                    $rootScope.api+"/"+type+"/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            postTaxonomyEntity: function(type, data) {
                return $http.post($rootScope.api+"/"+type, data,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            patchTaxonomyEntity: function(type, id, data) {
                return $http.patch($rootScope.api+"/"+type+"/"+id, data,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            removeTaxonomyEntity: function(type, id) {
                return $http.delete($rootScope.api+"/"+type+"/"+id,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getFormType: function(entity, type) {
                let form;
                switch(type) {
                    case 'testators':
                        form = {
                            name: entity.name,
                            surname: entity.surname,
                            firstnames: entity.firstnames,
                            profession: entity.profession,
                            address: entity.address,
                            dateOfBirth: entity.dateOfBirth,
                            placeOfBirth: entity.placeOfBirth.id,
                            dateOfDeath: entity.dateOfDeath,
                            placeOfDeath: entity.placeOfDeath.id,
                            deathMention: entity.deathMention,
                            memoireDesHommes: entity.memoireDesHommes,
                            regiment: entity.regiment.id,
                            rank: entity.rank,
                            description: entity.description,
                            updateComment: entity.updateComment
                        };
                        break;
                    case 'regiments':
                        form = {
                            name: entity.name,
                            description: entity.description,
                            updateComment: entity.updateComment
                        };
                        break;
                    case 'places':
                        form = {
                            name: entity.name,
                            frenchDepartement: entity.frenchDepartement,
                            frenchRegion: entity.frenchRegion,
                            country: entity.country,
                            geonamesId: entity.geonamesId,
                            geographicalCoordinates: entity.geographicalCoordinates,
                            description: entity.description,
                            updateComment: entity.updateComment
                        };
                        break;
                    default:
                        form = {
                            name: entity.name,
                            description: entity.description
                        };
                }
                return form;
            }
        };
    })

;