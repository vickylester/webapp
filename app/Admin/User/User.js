'use strict';

angular.module('transcript.admin.user', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.user', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminUserCtrl'
                }
            },
            url: '/users'
        })
    }])

    .controller('AdminUserCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;