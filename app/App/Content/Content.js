'use strict';

angular.module('transcript.app.content', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.content', {
            views: {
                "page" : {
                    templateUrl: 'App/Content/Content.html',
                    controller: 'AppContentCtrl'
                },
                "comment@app.content" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            url: '/content/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.blog',
                label: '{{ content.title }}'
            },
            resolve: {
                content: function(ContentService, $transition$) {
                    return ContentService.getContent($transition$.params().id, true);
                },
                thread: function(CommentService, $transition$) {
                    return CommentService.getThread('content-'+$transition$.params().id);
                }
            }
        })
    }])

    .controller('AppContentCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'content', function($rootScope, $scope, $http, $sce, $state, content) {
       $scope.content = content;
       console.log($scope.content);
    }])
;