'use strict';

angular.module('transcript.admin.entity.import', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.entity.import', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Entity/Import/Import.html',
                    controller: 'AdminEntityImportCtrl'
                }
            },
            url: '/import'
        })
    }])

    .controller('AdminEntityImportCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;