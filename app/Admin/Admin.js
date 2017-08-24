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
                },
                "footer" : {
                    templateUrl: 'System/Footer/Footer.html',
                    controller: 'SystemFooterCtrl'
                }
            },
            url: '/admin',
            resolve: {
                appPreference: function(AppService) {
                    return AppService.getPreference();
                },
                user: function(UserService) {
                    return UserService.getCurrent();
                }
            }
        })
    }])

    .controller('AdminCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', 'appPreference', function($rootScope, $scope, $http, $sce, $state, user, appPreference) {
        if (user !== null) {
            if($rootScope.user === undefined) {
                $rootScope.user = user;
            }

            console.log($rootScope.user);
            if ($rootScope.user !== undefined) {
                if($.inArray("ROLE_ADMIN", $rootScope.user.roles) !== -1) {
                    $rootScope.user.isAdmin = true;
                } else {
                    $rootScope.user.isAdmin = false;
                    $state.go("error.403");
                }
            }
        } else {
            $state.go("app.security.login");
        }

        $rootScope.preferences = appPreference;
    }])
;