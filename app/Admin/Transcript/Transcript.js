'use strict';

angular.module('transcript.admin.transcript', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.transcript', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminTranscriptCtrl'
                }
            },
            url: '/transcripts'
        })
    }])

    .controller('AdminTranscriptCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;