'use strict';

angular.module('transcript.app.security.resetting', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.resetting', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppSecurityResettingCtrl'
                }
            },
            url: '/resetting'
        })
    }])

    .controller('AppSecurityResettingCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', function($rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(' | Réinitialisation du mot de passe '+tfMetaTags.getTitleSuffix());
    }])
;