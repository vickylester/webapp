'use strict';

angular.module('transcript.app.security.login', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.security.login', {
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

    .controller('AppSecurityLoginCtrl', ['$rootScope', '$scope', '$http', '$sce', '$state', '$cookies', function($rootScope, $scope, $http, $sce, $state, $cookies) {
        $scope.form = {
            login: null,
            password: null
        };
        $scope.errors = [];
        $scope.submit = {
            isLoading: false
        };
        if($rootScope.user !== undefined) {$state.go('app.user.profile');}

        /* Loading data */
        $scope.submit.action = function() {
            $scope.errors = [];
            $scope.submit.isLoading = true;
            $http.post("http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/auth-tokens", $scope.form)
                .then(function (response) {
                    console.log(response.data);
                    $rootScope.access_token = response.data.value;
                    $rootScope.user = response.data.user;
                    $cookies.put('transcript_security_token', $rootScope.access_token);
                    $state.go('app.home');
                }, function errorCallback(response) {
                    console.log(response);
                    if(response.data.code === 400) {
                        for(var field in response.data.errors.children) {
                            for(var error in response.data.errors.children[field]) {
                                if(error === "errors") {
                                    $scope.errors.push({field: field, error: response.data.errors.children[field][error]});
                                }
                            }
                        }
                    }
                    if(response.status === 400 || response.data.message !== undefined) {
                        $scope.errors.push({field: "Warning", error: [response.data.message]});
                    }
                    $scope.submit.isLoading = false;
                });
        };
    }])
;