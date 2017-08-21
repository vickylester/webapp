'use strict';

angular.module('transcript.app.security.resetting.request', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.security.resetting.request', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Resetting/Request/Request.html',
                        controller: 'AppSecurityResettingRequestCtrl'
                }
            },
            url: '/request',
            ncyBreadcrumb: {
                parent: 'app.security.login',
                label: 'Mot de passe oublié'
            }
        })
    }])

    .controller('AppSecurityResettingRequestCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
        $scope.form = {
            email: null
        };
        $scope.submit = {
            loading: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;

            reset();
            function reset() {
                return UserService.askReset($scope.form.email).
                then(function(data) {
                    if(data === true) {
                        $state.go("app.security.resetting.check");
                    }
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    console.log(response);
                });
            }
        };
    }])
;