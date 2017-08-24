'use strict';

angular.module('transcript.system.footer', ['ui.router'])
    .controller('SystemFooterCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'appPreference', function($rootScope, $scope, $http, $sce, $state, appPreference) {
        $rootScope.preferences = appPreference;
    }])
;