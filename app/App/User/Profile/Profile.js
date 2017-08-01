'use strict';

angular.module('transcript.app.user.profile', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('app.user.profile', {
                views: {
                    "page" : {
                        templateUrl: 'App/User/Profile/Profile.html',
                        controller: 'AppUserProfileCtrl'
                    }
                },
                url: '/profile/{id}',
                ncyBreadcrumb: {
                    parent: 'app.home',
                    label: '{{ iUser.name }}'
                },
                requireLogin: true,
                resolve: {
                    userEdit: function(UserService, $transition$) {
                        return UserService.getUser($transition$.params().id);
                    }
                }
            })
    }])

    .controller('AppUserProfileCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'userEdit', 'EntityService', function($rootScope, $scope, $http, $sce, $state, userEdit, EntityService) {
        console.log($rootScope.user);
        console.log(userEdit);

        $scope.context = "view";
        $scope.iUser = userEdit;
        if($rootScope.user === undefined) {
            $scope.context = "view";
        } else if($rootScope.user.id === $scope.iUser.id) {
            $scope.context = "self";
        } else if($rootScope.user.id !== $scope.iUser.id && $rootScope.user.isAdmin === true) {
            $scope.context = "admin";
        }
    }])
;