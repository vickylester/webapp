'use strict';

angular.module('transcript.app.security.register', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('register', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                        controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/Security/Register/Register.html',
                        controller: 'AppSecurityRegisterCtrl'
                }
            },
            url: '/register'
        })
    }])

    .controller('AppSecurityRegisterCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
        $scope.page = {};
        $scope.form = {
            name: null,
            email: null,
            password: {
                plain: null,
                confirmation: null
            },
            errors: []
        };

        /* Loading data */
        $scope.register = function() {
            if($scope.form.password.plain === $scope.form.password.confirmation) {
                $scope.form.errors = [];
                $http.post("http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/users",
                    {
                        'name': $scope.form.name,
                        'email': $scope.form.email,
                        'plainPassword': $scope.form.password.plain
                    })
                    .then(function (response) {
                        if(response.status === 201) {
                            console.log(response.data);
                            $state.go('check');
                        }
                    }, function errorCallback(response) {
                        console.log(response);
                        if(response.data.code === 400) {
                            console.log("error");
                            for(var field in response.data.errors.children) {
                                for(var error in response.data.errors.children[field]) {
                                    if(error === "errors") {
                                        $scope.form.errors.push({field: field, error: response.data.errors.children[field][error]});
                                    }
                                }
                            }
                        }
                    });
            } else {
                $scope.form.errors.push('Password and confirmation are not the same');
            }
        };
    }])
;