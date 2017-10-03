'use strict';

angular.module('transcript.service.will', ['ui.router'])

    .service('WillService', function($http, $rootScope) {
        return {
            postWill: function(data) {
                return $http.post($rootScope.api+"/wills", data).
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