'use strict';

angular.module('transcript.app.user.change-password', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.user.changePassword', {
            views: {
                "page" : {
                    templateUrl: 'App/User/ChangePassword/ChangePassword.html',
                    controller: 'AppUserChangePasswordCtrl'
                }
            },
            url: '/change-password/{id}',
            ncyBreadcrumb: {
                parent: 'app.user.profile({id: user.id})',
                label: 'Modification du mot de passe'
            },
            requireLogin: true,
            resolve: {
                userEdit: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().id);
                }
            }
        })
    }])

    .controller('AppUserChangePasswordCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'userEdit', function($rootScope, $scope, $http, $sce, $state, userEdit) {
        if($rootScope.user === undefined && $rootScope.user !== userEdit) {$state.go('login');}

        $scope.form = {
            name: $rootScope.user.name,
            email: $rootScope.user.email,
            errors: []
        };
        $scope.submit = {
            isLoading: false
        };

        /* Submit data */
        $scope.submit.action = function() {
            $scope.submit.isLoading = true;
            $scope.form.errors = [];
            $http.patch($rootScope.api+"/users/"+$rootScope.user.id,
                {
                    'name': $scope.form.name,
                    'email': $scope.form.email
                }, { headers:  {
                    'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
                })
                .then(function (response) {
                    if(response.status === 200) {
                        $state.go('app.user.profile', {id: userEdit.id});
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
        };
    }])
;