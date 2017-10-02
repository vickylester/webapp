'use strict';

angular.module('transcript.app.training', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training', {
            views: {
                "page" : {
                    templateUrl: 'App/Training/Training.html',
                    controller: 'AppTrainingCtrl'
                }
            },
            url: '/training',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Découvrir'
            },
            tfMetaTags: {
                title: 'Découvrir',
            }
        })
    }])

    .controller('AppTrainingCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;