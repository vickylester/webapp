'use strict';

angular.module('transcript.app.taxonomy', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.taxonomy', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>'
                }
            },
            url: '/taxonomy'
        })
    }])

    .service('GeonamesService', function($http, $rootScope) {
        return {
            search: function(keywords) {
                return $http.get("http://api.geonames.org/searchJSON?formatted=true&username=testamentsdepoilus&maxRows=3&continentCode=EU&lang=fr&searchlang=fr&inclBbox=false&q="+keywords).then(function(response) {
                    return response.data;
                });
            }
        };
    })
;