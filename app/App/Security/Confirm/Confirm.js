'use strict';

angular.module('transcript.app.security.confirm', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.confirm', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Confirm/Confirm.html',
                        controller: 'AppSecurityConfirmCtrl'
                }
            },
            url: '/confirm/{token}',
            tfMetaTags: {
                title: 'Confirmation d\'inscription',
            },
            resolve: {
                confirmation: function(UserService, $transition$) {
                    return UserService.confirm($transition$.params().token);
                }
            }
        })
    }])

    .controller('AppSecurityConfirmCtrl', ['$rootScope','$scope', '$http', '$sce', 'confirmation', function($rootScope, $scope, $http, $sce, confirmation) {
        $scope.status = confirmation.code;
    }])
;