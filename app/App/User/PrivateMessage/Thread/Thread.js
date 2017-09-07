'use strict';

angular.module('transcript.app.user.private-message.thread', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.private-message.thread', {
            views: {
                "page" : {
                    templateUrl: 'App/User/PrivateMessage/Thread/Thread.html',
                    controller: 'AppUserPrivateMessageThreadCtrl'
                },
                "comment@transcript.app.user.private-message.thread" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            url: '/conversation/{idUser}/{idRecipient}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.private-message.list({id: iUser.id})',
                label: '{{ recipientUser.name }}'
            },
            resolve: {
                thread: function(CommentService, $transition$) {
                    return CommentService.getThreadSharedByUsers($transition$.params().idUser, $transition$.params().idRecipient);
                },
                iUser: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().idUser, "full");
                },
                recipientUser: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().idRecipient, "full");
                }
            }
        })
    }])

    .controller('AppUserPrivateMessageThreadCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'thread', 'iUser', 'recipientUser', function($rootScope, $scope, $http, $sce, $state, flash, thread, iUser, recipientUser) {
        $scope.thread = thread;
        $scope.iUser = iUser;
        $scope.recipientUser = recipientUser;

        if($scope.thread === null || $scope.thread === undefined || $scope.thread.thread === undefined || $scope.thread.thread.id === undefined) {
            $state.reload();
            console.log('reload');
        }
    }])
;