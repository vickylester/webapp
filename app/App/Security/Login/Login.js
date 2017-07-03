'use strict';

angular.module('transcript.app.security.login', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('login', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                        controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/Security/Login/Login.html',
                        controller: 'AppSecurityLoginCtrl'
                }
            },
            url: '/login'
        })
    }])

    .controller('AppSecurityLoginCtrl', ['$rootScope', '$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
        $scope.page = {};
        $scope.form = {
            email: null,
            password: null
        };

        /* Loading data */
        $scope.login = function() {
            $http.post("http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/auth-tokens", {login: $scope.form.email, password: $scope.form.password})
                .then(function (response) {
                    console.log(response.data);
                    $rootScope.access_token = response.data.value;
                    $rootScope.user = response.data.user;
                    $state.go('home');
                });
        };
    }])
;