'use strict';

angular.module('transcript.app.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('home', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/Home/Home.html',
                    controller: 'AppHomeCtrl'
                }
            },
            url: '/home'
        })
    }])

    .controller('AppHomeCtrl', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
        $scope.page = {
            loading: true
        };
        $scope.entities = null;


        /* Loading data */
        $http.get("http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/entities")
            .then(function (response) {
                $scope.entities = response.data;
                $scope.page.loading = false;
            });

    }])
;