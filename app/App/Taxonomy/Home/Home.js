'use strict';

angular.module('transcript.app.taxonomy.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.taxonomy.home', {
            views: {
                "page" : {
                    templateUrl: 'App/Taxonomy/Home/Home.html',
                    controller: 'AppTaxonomyHomeCtrl'
                }
            },
            url: '',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Documenter'
            }
        })
    }])

    .controller('AppTaxonomyHomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', function($rootScope, $scope, $http, $sce, $state, flash) {

    }])
;