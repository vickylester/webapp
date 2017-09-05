'use strict';

angular.module('transcript.app.user.private-message.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.privateMessage.list', {
            views: {
                "page" : {
                    templateUrl: 'App/User/PrivateMessage/List/List.html',
                    controller: 'AppUserPrivateMessageListCtrl'
                }
            },
            url: '/list/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: user.id})',
                label: 'Messages privés'
            },
            resolve: {
                threads: function(CommentService) {
                    return CommentService.getThreadsBySelfUser();
                },
                iUser: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().idUser, "full");
                }
            }
        })
    }])

    .controller('AppUserPrivateMessageListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'threads', 'iUser', function($rootScope, $scope, $http, $sce, $state, flash, threads, iUser) {
        $scope.threads = threads;
        $scope.iUser = iUser;
        console.log($scope.threads);
    }])
;