'use strict';

angular.module('transcript.app.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.home', {
            views: {
                "page" : {
                    templateUrl: 'App/Home/Home.html',
                    controller: 'AppHomeCtrl'
                }
            },
            ncyBreadcrumb: {
                label: 'Home'
            },
            url: '/',
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities();
                },
                contents: function(ContentService) {
                    return ContentService.getContents("blogContent", "public", "DESC", 10, 0);
                },
                staticContents: function(ContentService) {
                    return ContentService.getContents("staticContent", "public", "DESC", 10, 1);
                },
            }
        })
    }])

    .controller('AppHomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entities', 'contents', 'staticContents', function($rootScope, $scope, $http, $sce, $state, entities, contents, staticContents) {
        $scope.entities = entities;
        $scope.contents = contents;
        $scope.staticContents = staticContents;
        console.log($scope.staticContents);
    }])
;