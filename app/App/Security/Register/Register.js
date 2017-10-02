'use strict';

angular.module('transcript.app.security.register', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.register', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Register/Register.html',
                        controller: 'AppSecurityRegisterCtrl'
                }
            },
            url: '/register',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Inscription'
            },
            tfMetaTags: {
                title: 'Inscription',
            },
            requireLogin: false
        })
    }])

    .controller('AppSecurityRegisterCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
        if($rootScope.user !== undefined) {$state.go('transcript.app.user.profile', {id: $rootScope.user.id});}
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
        $scope.submit = {
            isLoading: false
        };

        /* Register data */
        $scope.submit.action = function() {
            $scope.submit.isLoading = true;
            if($scope.form.password.plain === $scope.form.password.confirmation) {
                $scope.form.errors = [];
                $http.post($rootScope.api+"/users",
                    {
                        'fos_user_registration_form' : {
                            'name': $scope.form.name,
                            'email': $scope.form.email,
                            'plainPassword': {
                                'first': $scope.form.password.plain,
                                'second': $scope.form.password.confirmation
                            }
                        }
                    })
                    .then(function (response) {
                        if(response.status === 201) {
                            $state.go('transcript.app.security.check');
                        }
                    }, function errorCallback(response) {
                        console.log(response);
                        if(response.data.code === 400) {
                            for(var field in response.data.errors.children) {
                                for(var error in response.data.errors.children[field]) {
                                    if(error === "errors") {
                                        $scope.form.errors.push({field: field, error: response.data.errors.children[field][error]});
                                    }
                                }
                            }
                        }
                        $scope.submit.isLoading = false;
                    });
            } else {
                $scope.form.errors.push('Password and confirmation are not the same');
                $scope.submit.isLoading = false;
            }
        };
    }])
;