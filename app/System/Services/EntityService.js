'use strict';

angular.module('transcript.service.entity', ['ui.router'])

    .service('EntityService', function($http, $rootScope, ResourceService) {
        return {
            getEntities: function() {
                return $http.get(
                    $rootScope.api+"/entities"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getEntity: function(id) {
                return $http.get(
                    $rootScope.api+"/entities/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            postEntity: function(data) {
                return $http.post($rootScope.api+"/entities", data,
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

            removeEntity: function(id) {
                return $http.delete($rootScope.api+"/entities/"+id,
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

            exportEntity: function(id) {
                return $http.get(
                    $rootScope.api+"/xml?context=export&type=entity&id="+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getContributionsNumberByUser: function(entity, user) {
                let count = 0;
                for(let idR in entity.resources) {
                    let resource = entity.resources[idR];
                    count += ResourceService.getContributionsNumberByUser(resource, user);
                }

                return count;
            },

            getContributors: function(entity) {
                let arrayContributors = [];
                for(let idR in entity.resources) {
                    let resource = entity.resources[idR];
                    arrayContributors = arrayContributors.concat(ResourceService.getContributors(resource));
                }

                return arrayContributors;
            }
        };
    })
;