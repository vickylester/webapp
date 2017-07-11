'use strict';

angular.module('transcript.system.error.404', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('error.404', {
            views: {
                "page" : {
                    templateUrl: 'System/Error/404/404.html',
                    controller: 'SystemError404Ctrl'
                }
            },
            url: '/404'
        })
    }])

    .controller('SystemError404Ctrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;