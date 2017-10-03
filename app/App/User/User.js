'use strict';

angular.module('transcript.app.user', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppUserCtrl'
                }
            },
            url: '/user'
        })
    }])

    .controller('AppUserCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', function($rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(' | Profil utilisateur '+tfMetaTags.getTitleSuffix());
    }])

;