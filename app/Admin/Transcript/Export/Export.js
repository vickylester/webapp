'use strict';

angular.module('transcript.admin.transcript.export', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.transcript.export', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Transcript/Export/Export.html',
                    controller: 'AdminTranscriptExportCtrl'
                }
            },
            url: '/export'
        })
    }])

    .controller('AdminTranscriptExportCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;