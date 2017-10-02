'use strict';

angular.module('transcript.admin.user.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.user.list', {
            views: {
                "page" : {
                    templateUrl: 'Admin/User/List/List.html',
                    controller: 'AdminUserListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Liste des utilisateurs'
            },
            tfMetaTags: {
                title: 'Liste des utilisateurs',
            },
            resolve: {
                users: function(UserService) {
                    return UserService.getUsers();
                }
            }
        })
    }])

    .controller('AdminUserListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'users', function($rootScope, $scope, $http, $sce, $state, users) {
        $scope.users = users;
    }])
;