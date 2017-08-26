'use strict';

angular.module('transcript.admin.thesaurus', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.thesaurus', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminThesaurusCtrl'
                }
            },
            url: '/thesaurus'
        })
    }])

    .controller('AdminThesaurusCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
    }])
;