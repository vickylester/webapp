'use strict';

angular.module('transcript.app.taxonomy.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.taxonomy.home', {
            views: {
                "page" : {
                    templateUrl: 'App/Taxonomy/Home/Home.html',
                    controller: 'AppTaxonomyHomeCtrl'
                }
            },
            url: '',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Documenter'
            },
            tfMetaTags: {
                title: 'Documenter',
            }
        })
    }])

    .controller('AppTaxonomyHomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', function($rootScope, $scope, $http, $sce, $state, flash) {

    }])
;