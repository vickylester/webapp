'use strict';

angular.module('transcript.app.user', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.user', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/User/User.html',
                    controller: 'AppUserCtrl'
                }
            },
            url: '/user',
            abstract: true
        })
    }])

    .service('UserService', function($http, $rootScope, $cookies) {
        return {
            getUsers: function() {
                return $http.get($rootScope.api+"/users").then(function(response) {
                    return response.data;
                });
            },
            getUser: function(id) {
                if(id !== undefined) {
                    return $http.get($rootScope.api+"/users/"+id).then(function(response) {
                        return response.data;
                    });
                } else {
                    if($cookies.get('transcript_security_token') !== undefined && $rootScope.user === undefined) {
                        $rootScope.user = null;
                        $rootScope.access_token = $cookies.get('transcript_security_token');

                        $http.get($rootScope.api+"/auth-token",{headers:{'X-Auth-Token': $rootScope.access_token}})
                            .then(function (response) {
                                $rootScope.user = response.data;
                            });
                    } else if($cookies.get('transcript_security_token') === undefined && $rootScope.user === undefined) {
                        return $rootScope.user = null;
                    }
                    return $rootScope.user;
                }
            }
        };
    })

    .controller('AppUserCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
        $scope.page = {};
    }])
;