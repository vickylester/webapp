'use strict';

angular.module('transcript.admin', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin', {
            abstract: true,
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminCtrl'
                }
            },
            url: '/admin',
            resolve: {
                user: function(UserService) {
                    return UserService.getCurrent();
                }
            }
        })
    }])

    .controller('AdminCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', function($rootScope, $scope, $http, $sce, $state, user) {
        if($rootScope.user === undefined) {$rootScope.user = user;}
        console.log("ok");
        if($rootScope.user === undefined) {$state.go("app.security.login");}
        else {
            if($.inArray("ROLE_ADMIN", $rootScope.user.roles) === -1) {
                $state.go("error.403");
            }
        }
    }])
;