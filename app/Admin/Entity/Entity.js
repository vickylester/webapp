'use strict';

angular.module('transcript.admin.entity', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.entity', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminEntityCtrl'
                }
            },
            url: '/entities'
        })
    }])

    .controller('AdminEntityCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;