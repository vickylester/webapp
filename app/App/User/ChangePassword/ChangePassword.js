'use strict';

angular.module('transcript.app.user.change-password', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.changePassword', {
            views: {
                "page" : {
                    templateUrl: 'App/User/ChangePassword/ChangePassword.html',
                    controller: 'AppUserChangePasswordCtrl'
                }
            },
            url: '/change-password/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: user.id})',
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

    .controller('AppUserChangePasswordCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'userEdit', 'UserService', function($rootScope, $scope, $http, $sce, $state, userEdit, UserService) {
        if($rootScope.user === undefined && $rootScope.user !== userEdit) {$state.go('transcript.app.security.login');}

        /* -- Breadcrumb management -------------------------------------------------------- */
        $scope.iUser = $rootScope.user;
        /* -- End : breadcrumb management -------------------------------------------------- */

        $scope.form = {
            current_password: "",
            password: {
                first: "",
                second: ""
            }
        };
        $scope.submit = {
            loading: false
        };

        /* Submit data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;

            submit();
            function submit() {
                return UserService.changePassword($scope.form.current_password, $scope.form.password.first, $scope.form.password.second).
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