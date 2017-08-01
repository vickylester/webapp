'use strict';

angular.module('transcript.admin.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.home', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Home/Home.html',
                    controller: 'AdminHomeCtrl'
                }
            },
            url: '/',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Admin'
            }
        })
    }])

    .controller('AdminHomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;