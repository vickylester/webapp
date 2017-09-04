'use strict';

angular.module('transcript.admin.taxonomy', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.taxonomy', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminTaxonomyCtrl'
                }
            },
            url: '/taxonomy'
        })
    }])

    .controller('AdminTaxonomyCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;