'use strict';

angular.module('transcript.system.error', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('error', {
            abstract: true,
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'ErrorCtrl'
                },
                "footer" : {
                    templateUrl: 'System/Footer/Footer.html',
                    controller: 'SystemFooterCtrl'
                }
            },
            url: '/error',
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

    .controller('ErrorCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', 'appPreference', function($rootScope, $scope, $http, $sce, $state, user, appPreference) {
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
                }
            }
        }
        console.log(appPreference);
        $rootScope.preferences = appPreference;
    }])
;