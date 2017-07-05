'use strict';

angular.module('transcript.app.training', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.training', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/Training/Training.html',
                    controller: 'AppTrainingCtrl'
                }
            },
            url: '/training'
        })
    }])

    .controller('AppTrainingCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;