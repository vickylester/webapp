'use strict';

angular.module('transcript.app.content', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.content', {
            views: {
                "page" : {
                    templateUrl: 'App/Content/Content.html',
                    controller: 'AppContentCtrl'
                }
            },
            url: '/content/{id}',
            resolve: {
                content: function(ContentService, $transition$) {
                    return ContentService.getContent($transition$.params().id);
                }
            }
        })
    }])

    .service('ContentService', function($http, $rootScope) {
        return {
            getContents: function() {
                return $http.get($rootScope.api+"/contents").then(function(response) {
                    return response.data;
                });
            },

            getContent: function(id) {
                return $http.get($rootScope.api+"/contents/"+id).then(function(response) {
                    return response.data;
                });
            }
        };
    })

    .controller('AppContentCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'content', function($rootScope, $scope, $http, $sce, $state, content) {
       $scope.content = content;
    }])
;