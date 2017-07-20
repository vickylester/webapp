'use strict';

angular.module('transcript.admin.transcript.validation', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.transcript.validation', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Transcript/Validation/Validation.html',
                    controller: 'AdminTranscriptValidationCtrl'
                }
            },
            url: '/validation'
        })
    }])

    .controller('AdminTranscriptValidationCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;