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

    .controller('AdminTaxonomyCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', function($rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(' - Notices d\'autorité '+tfMetaTags.getTitleSuffix());
    }])
;