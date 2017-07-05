'use strict';

angular.module('transcript.app.user.profile', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('app.user.profile.own', {
                views: {
                    "navbar" : {
                        templateUrl: 'System/Navbar/Navbar.html',
                        controller: 'SystemNavbarCtrl'
                    },
                    "page" : {
                        templateUrl: 'App/User/Profile/Profile.html',
                        controller: 'AppUserProfileCtrl'
                    }
                },
                url: '/profile',
                requireLogin: true,
                resolve: {
                    user: function(UserService) {
                        return UserService.getUser();
                    },
                    access: function(SecurityService){
                        return SecurityService.getAccess($stateProvider);
                    }
                }
            })
            .state('app.user.profile', {
                views: {
                    "navbar" : {
                        templateUrl: 'System/Navbar/Navbar.html',
                        controller: 'SystemNavbarCtrl'
                    },
                    "page" : {
                        templateUrl: 'App/User/Profile/Profile.html',
                        controller: 'AppUserProfileCtrl'
                    }
                },
                url: '/profile/{id}',
                requireLogin: true,
                resolve: {
                    user: function(UserService, $transition$) {
                        return UserService.getUser($transition$.params().id);
                    }
                }
            })
    }])

    .controller('AppUserProfileCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', function($rootScope, $scope, $http, $sce, $state, user) {
        $scope.page = {};
        $rootScope.user = user;
        if($rootScope.user === undefined) {$state.go('login');}
    }])
;