'use strict';

angular.module('transcript.service.contact', ['ui.router'])

    .service('ContactService', function($http, $rootScope, $sce) {
        return {
            send: function(form) {
                return $http.post($rootScope.api+"/contact", form).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
            }
        };
    })

;