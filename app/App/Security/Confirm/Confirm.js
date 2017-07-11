'use strict';

angular.module('transcript.app.security.confirm', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.security.confirm', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Confirm/Confirm.html',
                        controller: 'AppSecurityConfirmCtrl'
                }
            },
            url: '/confirm'
        })
    }])

    .controller('AppSecurityConfirmCtrl', ['$rootScope','$scope', '$http', '$sce', function($rootScope, $scope, $http, $sce) {
        $scope.page = {};
    }])
;