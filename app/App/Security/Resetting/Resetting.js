'use strict';

angular.module('transcript.app.security.resetting', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.security.resetting', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Resetting/Resetting.html',
                        controller: 'AppSecurityResettingCtrl'
                }
            },
            url: '/resetting'
        })
    }])

    .controller('AppSecurityResettingCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
        $scope.form = {
            email: null
        };
        $scope.submit = {
            loading: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;


        };
    }])
;