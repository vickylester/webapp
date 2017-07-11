'use strict';

angular.module('transcript.app.contact', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.contact', {
            views: {
                "page" : {
                    templateUrl: 'App/Contact/Contact.html',
                    controller: 'AppContactCtrl'
                }
            },
            url: '/contact'
        })
    }])

    .controller('AppContactCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;