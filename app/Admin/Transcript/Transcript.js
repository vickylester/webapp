'use strict';

angular.module('transcript.admin.transcript', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.transcript', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/Transcript/Transcript.html',
                    controller: 'AdminTranscriptCtrl'
                }
            },
            url: '/transcripts',
            abstract: true
        })
    }])

    .controller('AdminTranscriptCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;