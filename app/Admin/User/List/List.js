'use strict';

angular.module('transcript.admin.user.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.user.list', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/User/List/List.html',
                    controller: 'AdminUserListCtrl'
                }
            },
            url: '/list',
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