'use strict';

angular.module('transcript.app.user.private-message.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.private-message.list', {
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
            tfMetaTags: {
                title: 'Messages privés',
            },
            resolve: {
                threads: function(CommentService) {
                    return CommentService.getThreadsBySelfUser();
                },
                iUser: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().id, "full");
                }
            }
        })
    }])

    .controller('AppUserPrivateMessageListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'UserService', 'threads', 'iUser', function($rootScope, $scope, $http, $sce, $state, flash, UserService, threads, iUser) {
        $scope.threads = threads;
        console.log($scope.threads);
        $scope.iUser = iUser;

        for(let idThread in $scope.threads) {
            let thread = $scope.threads[idThread];
            let info = thread.id.split('-');
            if(parseInt(info[1]) === $scope.iUser.id) {
                thread.iUser = info[1];
            } else {
                return UserService.getUser(info[1]).then(function(data) {
                    thread.recipient = data;
                });
            }

            if(parseInt(info[2]) === $scope.iUser.id) {
                thread.iUser = info[2];
            } else {
                return UserService.getUser(info[1]).then(function(data) {
                    thread.recipient = data;
                });
            }
        }
    }])
;