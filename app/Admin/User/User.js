'use strict';

angular.module('transcript.admin.user', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.user', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/User/User.html',
                    controller: 'AdminUserCtrl'
                }
            },
            url: '/users'
        })
    }])

    .service('UserService', function($http, $rootScope) {
        return {
            getUsers: function() {
                return $http.get($rootScope.api+"/user").then(function(response) {
                    return response.data;
                });
            },

            getUser: function(id) {
                return $http.get($rootScope.api+"/users/"+id).then(function(response) {
                    return response.data;
                });
            }
        };
    })

    .controller('AdminUserCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;