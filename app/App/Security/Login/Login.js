'use strict';

angular.module('transcript.app.security.login', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.login', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Login/Login.html',
                    controller: 'AppSecurityLoginCtrl'
                }
            },
            url: '/login',
            tfMetaTags: {
                title: 'Connexion',
            },
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Connexion'
            }
        })
    }])

    .controller('AppSecurityLoginCtrl', ['$rootScope', '$scope', '$http', '$sce', '$state', '$cookies', 'UserService', 'flash', function($rootScope, $scope, $http, $sce, $state, $cookies, UserService, flash) {
        if($rootScope.user !== undefined && $rootScope.user !== null) {
            $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
        }

        $scope.form = {
            username: null,
            password: null,
            //grant_type: "password",
            //client_id: $rootScope.client_id,
            //client_secret: $rootScope.client_secret
        };
        $scope.errors = [];
        $scope.submit = {
            loading: false
        };

        /* Loading data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;
            // Connecting user:
            login();
            function login() {
                return UserService.login($scope.form, "transcript.app.home").
                then(function(data) {
                    console.log(data);
                    $scope.submit.loading = false;
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    console.log(response);
                });
            }
        };
    }])
;