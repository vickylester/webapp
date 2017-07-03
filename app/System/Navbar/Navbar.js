'use strict';

angular.module('transcript.system.navbar', ['ui.router'])
    .controller('SystemNavbarCtrl', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
        $scope.page = {
            loading: true
        };
    }])
;