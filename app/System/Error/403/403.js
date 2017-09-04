'use strict';

angular.module('transcript.system.error.403', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.error.403', {
            views: {
                "page" : {
                    templateUrl: 'System/Error/403/403.html',
                    controller: 'SystemError403Ctrl'
                }
            },
            url: '/403'
        })
    }])

    .controller('SystemError403Ctrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;