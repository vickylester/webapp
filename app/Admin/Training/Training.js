'use strict';

angular.module('transcript.admin.training', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.training', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminTrainingCtrl'
                }
            },
            url: '/entrainements'
        })
    }])


    .controller('AdminTrainingCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', function($rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(' - Entrainement '+tfMetaTags.getTitleSuffix());
    }])
;