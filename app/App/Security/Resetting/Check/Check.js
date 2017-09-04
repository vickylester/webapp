'use strict';

angular.module('transcript.app.security.resetting.check', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.resetting.check', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Resetting/Check/Check.html',
                        controller: 'AppSecurityResettingCheckCtrl'
                }
            },
            url: '/check'
        })
    }])

    .controller('AppSecurityResettingCheckCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {}])
;