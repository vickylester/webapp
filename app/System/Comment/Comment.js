'use strict';

angular.module('transcript.system.comment', ['ui.router'])
    .controller('SystemCommentCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'thread', 'CommentService', function($rootScope, $scope, $http, $sce, $state, thread, CommentService) {
        $scope.threadContainer = thread;
        //console.log($scope.threadContainer);

        $scope.comment = {
            action: {
                isLoading: false
            },
            form: {
                content: null
            }
        };
        $scope.admin = {};

        $scope.comment.action.post = function() {
            $scope.comment.action.isLoading = true;
            $http.post($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments',
                {
                    "fos_comment_comment":
                    {
                        "body": $scope.comment.form.content
                    }
                },
                {
                    headers:  {
                        'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                    }
                })
                .then(function (response) {
                    $http.get($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments')
                        .then(function (response) {
                                //console.log(response.data);
                                for(var comment in response.data.comments) {
                                    response.data.comments[comment].comment.body = $sce.trustAsHtml(response.data.comments[comment].comment.body);
                                }
                                $scope.threadContainer = response.data;
                                $scope.comment.form.content = "";
                                $scope.comment.action.isLoading = false;
                            }
                        );
                }, function errorCallback(response) {
                    console.log(response);
                    $scope.comment.action.isLoading = false;
                }
            );
        };

        $scope.options = {
            language: 'fr',
            allowedContent: true,
            entities: false,
            height: '140px',
            removePlugins: 'elementspath',
            resize_enabled: false,
            toolbar: [
                ['Bold','Italic','Underline','StrikeThrough','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','NumberedList','BulletedList','-','Link','-','Undo','Redo']
            ]
        };

        /* Cette function ne marche pas*/
        $scope.admin.remove = function(id) {
            $http.get($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments/'+id+'/remove',
                {
                    headers:  {
                        'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                    }
                })
                .then(function (response) {
                    console.log(response);
                }, function errorCallback(response) {
                    console.log(response);
                    $scope.comment.action.isLoading = false;
                });
        }
    }])
;