'use strict';

angular.module('transcript.service.user-preference', ['ui.router'])

    .service('UserPreferenceService', function($http, $rootScope, $cookies, $state, $sce, $filter, flash) {
        return {
            getPreferences: function(id) {
                return $http.get($rootScope.api+"/preferences?user="+id, { headers:  {
                    'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
                }).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            patchPreferences: function(form, id) {
                return $http.patch(
                    $rootScope.api+"/preferences/"+id,
                    form,
                    { headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
        };
    })

;