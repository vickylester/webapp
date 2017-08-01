'use strict';

angular.module('transcript.system.navbar', ['ui.router'])
    .controller('SystemNavbarCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', 'appPreference', function($rootScope, $scope, $http, $sce, $state, user, appPreference) {
        console.log(appPreference);
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
        $rootScope.preferences = appPreference;
    }])
;