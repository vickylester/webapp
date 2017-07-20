'use strict';

angular.module('transcript.app', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app', {
            abstract: true,
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppCtrl'
                }
            },
            url: '',
            resolve: {
                user: function(UserService) {
                    return UserService.getCurrent();
                }
            }
        })
    }])

    .controller('AppCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', function($rootScope, $scope, $http, $sce, $state, user) {
        if (user !== null) {
            if ($rootScope.user === undefined) {
                $rootScope.user = user;
            }

            console.log($rootScope.user);
            if ($rootScope.user !== undefined) {
                if ($.inArray("ROLE_ADMIN", $rootScope.user.roles) !== -1) {
                    $rootScope.user.isAdmin = true;
                } else {
                    $rootScope.user.isAdmin = false;
                }
            }
        }
    }])
;