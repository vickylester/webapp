'use strict';

angular.module('transcript.app.content', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.content', {
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
                parent: 'app.blog',
                label: '{{ content.title }}'
            },
            resolve: {
                content: function(ContentService, $transition$) {
                    return ContentService.getContent($transition$.params().id, true);
                },
                thread: function(CommentService, $transition$) {
                    if(CommentService.getThread('content-'+$transition$.params().id) === null) {
                        CommentService.postThread('content-'+$transition$.params().id);
                        return CommentService.getThread('content-'+$transition$.params().id);
                    } else {
                        return CommentService.getThread('content-'+$transition$.params().id);
                    }
                }
            }
        })
    }])

    .service('ContentService', function($http, $rootScope, $sce) {
        return {
            getContents: function(type, status, date, limit) {
                var typeContainer = "",
                    statusContainer = "",
                    dateContainer = "",
                    limitContainer = "",
                    arrayContainer = [];

                if(type !== null) {typeContainer = "type="+type; arrayContainer.push(typeContainer);}
                if(status !== null) {statusContainer = "status="+status; arrayContainer.push(statusContainer);}
                if(date !== null) {dateContainer = "date="+date; arrayContainer.push(dateContainer);}
                if(limit !== null) {limitContainer = "limit="+limit; arrayContainer.push(limitContainer);}
                var query = arrayContainer.join("&");

                return $http.get($rootScope.api+"/contents?"+query).then(function(response) {
                    for(var id in response.data) {
                        response.data[id].content = $sce.trustAsHtml(response.data[id].content);
                    }
                    return response.data;
                });
            },

            getContent: function(id, encode) {
                return $http.get($rootScope.api+"/contents/"+id).then(function(response) {
                    if(encode === true) {response.data.content = $sce.trustAsHtml(response.data.content);}
                    return response.data;
                });
            }
        };
    })

    .controller('AppContentCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'content', function($rootScope, $scope, $http, $sce, $state, content) {
       $scope.content = content;
       console.log($scope.content);
    }])
;