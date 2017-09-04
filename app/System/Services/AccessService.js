'use strict';

angular.module('transcript.service.access', ['ui.router'])

    .service('AccessService', function($http, $rootScope, $cookies, $state, $sce, flash) {
        return {
            getAccesses: function() {
                return $http.get($rootScope.api+"/accesses", { headers:  {
                    'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
                }).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    //if()
                    return response;
                });
            },
            getAccessByUser: function(userId) {
                return $http.get(
                    $rootScope.api+"/accesses?user="+userId
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getAccess: function(id) {
                return $http.get(
                    $rootScope.api+"/accesses/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            patchAccess: function(form, accessId) {
                return $http.patch($rootScope.api+"/accesses/"+accessId, form, { headers:  {
                    'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
                }).then(function(response) {
                    console.log(response);
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            }
        };
    })

;