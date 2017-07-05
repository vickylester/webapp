'use strict';

angular.module('transcript.app', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/App.html',
                    controller: 'AppCtrl'
                }
            },
            url: ''
        })
    }])

    .controller('AppCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {


    }])
;