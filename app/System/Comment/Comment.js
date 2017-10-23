'use strict';

angular.module('transcript.system.comment', ['ui.router'])
    .controller('SystemCommentCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'thread', 'CommentService', function($rootScope, $scope, $http, $sce, $state, thread, CommentService) {
        $scope.threadContainer = thread;
        console.log($scope.threadContainer);

        $scope.comment = {
            action: {
                loading: false
            },
            form: {
                content: null
            },
            edit: {
                loading: false
            }
        };
        $scope.admin = {};
        $scope.editContent = {};

        $scope.comment.action.post = function() {
            $scope.comment.action.loading = true;
            $http.post($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments',
                {
                    "fos_comment_comment":
                    {
                        "body": $scope.comment.form.content
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
                                $scope.comment.action.loading = false;
                            }
                        );
                }, function errorCallback(response) {
                    console.log(response);
                    $scope.comment.action.loading = false;
                }
            );
        };

        $scope.comment.edit.load = function(id) {
            for(let iC in $scope.threadContainer.comments) {
                if($scope.threadContainer.comments[iC].comment.id === id) {
                    $scope.threadContainer.comments[iC].editAction = true;
                    $scope.editContent[id] = $sce.getTrustedHtml($scope.threadContainer.comments[iC].comment.body);
                }
            }
        };

        $scope.comment.edit.action = function(id) {
            $scope.comment.edit.loading = true;
            $http.put($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments/'+id,
                {
                    "fos_comment_comment":
                        {
                            "body": $scope.editContent[id]
                        }
                })
                .then(function (response) {
                    $scope.comment.edit.loading = false;
                    console.log(response);
                    for(let iC in $scope.threadContainer.comments) {
                        if($scope.threadContainer.comments[iC].comment.id === id) {
                            delete $scope.threadContainer.comments[iC].editAction;
                            $scope.threadContainer.comments[iC].comment.body = $sce.trustAsHtml($scope.editContent[id]);
                        }
                    }
                    delete $scope.editContent[id];
                });
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
            $http.patch($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments/'+id+'/state',
                {"fos_comment_delete_comment":
                    {
                        "state": 1
                    }
                })
                .then(function (response) {
                    console.log(response);
                    for(let iC in $scope.threadContainer.comments) {
                        if($scope.threadContainer.comments[iC].comment.id === id) {
                            $scope.threadContainer.comments[iC].comment.state = 1;
                        }
                    }
                }, function errorCallback(response) {
                    console.log(response);
                    $scope.comment.action.loading = false;
                });
        }
    }])
;