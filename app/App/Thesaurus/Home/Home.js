'use strict';

angular.module('transcript.app.thesaurus.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.thesaurus.home', {
            views: {
                "page" : {
                    templateUrl: 'App/Thesaurus/Home/Home.html',
                    controller: 'AppThesaurusHomeCtrl'
                }
            },
            url: '',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Documenter'
            }
        })
    }])

    .controller('AppThesaurusHomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', function($rootScope, $scope, $http, $sce, $state, flash) {

    }])
;