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
                return $http.post($rootScope.api+"/"+type, data).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            patchTaxonomyEntity: function(type, id, data) {
                return $http.patch($rootScope.api+"/"+type+"/"+id, data).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            removeTaxonomyEntity: function(type, id) {
                return $http.delete($rootScope.api+"/"+type+"/"+id).
                then(function(response) {
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
                        let MDH = entity.memoireDesHommes.split(',');
                        if(entity.memoireDesHommes.indexOf(',') !== -1) {
                            MDH = [entity.memoireDesHommes];
                        }

                        form = {
                            name: entity.name,
                            surname: entity.surname,
                            firstnames: entity.firstnames,
                            profession: entity.profession,
                            addressNumber: entity.addressNumber,
                            addressStreet: entity.addressStreet,
                            addressDistrict: entity.addressDistrict,
                            addressCity: entity.addressCity,
                            dateOfBirth: entity.dateOfBirth,
                            yearOfBirth: entity.yearOfBirth,
                            placeOfBirth: entity.placeOfBirth.id,
                            dateOfDeath: entity.dateOfDeath,
                            yearOfDeath: entity.yearOfDeath,
                            placeOfDeath: entity.placeOfDeath.id,
                            deathMention: entity.deathMention,
                            memoireDesHommes: MDH,
                            militaryUnit: entity.militaryUnit.id,
                            rank: entity.rank,
                            description: entity.description,
                            updateComment: entity.updateComment
                        };
                        break;
                    case 'military-units':
                        form = {
                            name: entity.name,
                            country: entity.country,
                            armyCorps: entity.armyCorps,
                            regimentNumber: entity.regimentNumber,
                            description: entity.description,
                            updateComment: entity.updateComment
                        };
                        break;
                    case 'places':
                        form = {
                            names: entity.names,
                            frenchDepartements: entity.frenchDepartements,
                            frenchRegions: entity.frenchRegions,
                            countries: entity.countries,
                            cities: entity.cities,
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