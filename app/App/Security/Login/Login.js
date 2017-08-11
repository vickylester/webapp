'use strict';

angular.module('transcript.app.security.login', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.security.login', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Login/Login.html',
                        controller: 'AppSecurityLoginCtrl'
                }
            },
            url: '/login',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Connexion'
            }
        })
    }])

    .controller('AppSecurityLoginCtrl', ['$rootScope', '$scope', '$http', '$sce', '$state', '$cookies', function($rootScope, $scope, $http, $sce, $state, $cookies) {
        //console.log(user);
        if($rootScope.user !== undefined) {$state.go('app.user.profile', {id: $rootScope.user.id});}

        $scope.form = {
            username: null,
            password: null,
            grant_type: "password",
            client_id: $rootScope.client_id,
            client_secret: $rootScope.client_secret
        };
        $scope.errors = [];
        $scope.submit = {
            loading: false
        };

        /* Loading data */
        $scope.submit.action = function() {
            $scope.errors = [];
            $scope.submit.loading = true;
            // Connecting user:
            $http.post($rootScope.api+"/oauth/v2/token", $scope.form)
            /*$http({
                url: $rootScope.api+"/oauth/v2/token?client_id="+$rootScope.client_id+"&client_secret="+$rootScope.client_secret+"&grant_type=password&username="+$scope.form.username+"&password="+$scope.form.password,
                method: "post",
            })*/
                .then(function (response) {
                    console.log(response.data);
                    $rootScope.oauth = response.data;
                    $rootScope.oauth.token_type = capitalizeFirstLetter($rootScope.oauth.token_type);
                    $cookies.put('transcript_security_token_access', $rootScope.oauth.access_token);
                    $cookies.put('transcript_security_token_type', $rootScope.oauth.token_type);
                    $cookies.put('transcript_security_token_refresh', $rootScope.oauth.refresh_token);
                    // Loading user's data:
                    $http.get($rootScope.api+"/users?token="+$rootScope.oauth.access_token,
                        { headers:  {
                                'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                            }
                        })
                        .then(function (response) {
                            console.log(response.data);
                            $rootScope.user = response.data;
                            $state.go('app.home');
                        });
                }, function errorCallback(response) {
                    $scope.submit.loading = true;
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
                    if(response.status === 400 || response.data.error_description !== undefined) {
                        $scope.errors.push({field: "Warning", error: [response.data.error_description]});
                    }
                });
        };
    }])
;