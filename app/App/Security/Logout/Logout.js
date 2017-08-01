'use strict';

angular.module('transcript.app.security.logout', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.security.logout', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Logout/Logout.html',
                        controller: 'AppSecurityLogoutCtrl'
                }
            },
            url: '/logout',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Déconnexion'
            }
        })
    }])

    .controller('AppSecurityLogoutCtrl', ['$rootScope', '$scope', '$http', '$sce', '$state', '$cookies', function($rootScope, $scope, $http, $sce, $state, $cookies) {
        if($rootScope.user !== undefined) {
            delete $rootScope.oauth.access_token;
            delete $rootScope.oauth.token_type;
            delete $rootScope.oauth.refresh_token;
            delete $rootScope.user;
            $cookies.remove('transcript_security_token_access');
            $cookies.remove('transcript_security_token_type');
            $cookies.remove('transcript_security_token_refresh');
            $state.go('app.home');
        } else {
            $state.go('app.home');
        }
    }])
;