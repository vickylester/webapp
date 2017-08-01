'use strict';

angular.module('transcript.app.blog', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.blog', {
            views: {
                "page" : {
                    templateUrl: 'App/Blog/Blog.html',
                    controller: 'AppBlogCtrl'
                }
            },
            url: '/blog',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Actualités'
            },
            resolve: {
                contents: function(ContentService, $transition$) {
                    return ContentService.getContents("blogContent", "public", "DESC", 30);
                }
            }
        })
    }])

    .controller('AppBlogCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'contents', function($rootScope, $scope, $http, $sce, $state, contents) {
       $scope.contents = contents;
    }])
;