'use strict';

angular.module('transcript.app.user.private-message.thread', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.privateMessage.thread', {
            views: {
                "page" : {
                    templateUrl: 'App/User/PrivateMessage/Thread/Thread.html',
                    controller: 'AppUserPrivateMessageThreadCtrl'
                },
                "comment@transcript.app.user.privateMessage.thread" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            url: '/{idUser}/{idRecipient}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.privateMessage.list({id: idUser})',
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
        console.log($scope.thread);
    }])
;