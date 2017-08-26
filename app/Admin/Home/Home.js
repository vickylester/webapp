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
            },
            resolve: {
                accesses: function(AccessService) {
                    return AccessService.getAccesses().then(function(data){
                        return data;
                    });
                }
            }
        })
    }])

    .controller('AdminHomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'accesses', function($rootScope, $scope, $http, $sce, $state, accesses) {
        $scope.accesses = accesses;
    }])
;