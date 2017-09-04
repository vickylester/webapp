'use strict';

angular.module('transcript.app.security.resetting.reset', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.resetting.reset', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Resetting/Reset/Reset.html',
                        controller: 'AppSecurityResettingResetCtrl'
                }
            },
            url: '/form/{token}',
            ncyBreadcrumb: {
                parent: 'transcript.app.security.login',
                label: 'Mot de passe oublié'
            },
            requireLogin: false
        })
    }])

    .controller('AppSecurityResettingResetCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', '$transition$', 'UserService', function($rootScope, $scope, $http, $sce, $state, flash, $transition$, UserService) {
        $scope.form = {
            password: {
                plain: null,
                confirmation: null
            }
        };
        $scope.submit = {
            loading: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;

            if($scope.form.password.plain === $scope.form.password.confirmation) {
                reset();
            } else {
                flash.error = $sce.trustAdHtml("<ul><li>Les mots de passe doivent être identiques !</li></ul>");
            }

            function reset() {
                return UserService.sendReset($transition$.params().token, $scope.form.password.plain,$scope.form.password.confirmation).
                then(function(data) {
                    $scope.submit.loading = false;

                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    console.log(response);
                });
            }
        };
    }])
;