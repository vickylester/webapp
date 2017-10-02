'use strict';

angular.module('transcript.app.blog', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.blog', {
            views: {
                "page" : {
                    templateUrl: 'App/Blog/Blog.html',
                    controller: 'AppBlogCtrl'
                }
            },
            url: '/blog',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Actualités'
            },
            tfMetaTags: {
                title: 'Actualités',
            },
            resolve: {
                contents: function(ContentService) {
                    return ContentService.getContents("blogContent", "public", "DESC", 30);
                }
            }
        })
    }])

    .controller('AppBlogCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'contents', function($rootScope, $scope, $http, $sce, $state, contents) {
       $scope.contents = contents;
    }])
;