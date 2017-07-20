'use strict';

angular.module('transcript.system.navbar', ['ui.router'])
    .controller('SystemNavbarCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
        $scope.page = {
            loading: true
        };
    }])
;