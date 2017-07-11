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
                requireLogin: true,
                resolve: {
                    userEdit: function(UserService, $transition$) {
                        return UserService.getUser($transition$.params().id);
                    }
                }
            })
    }])

    .controller('AppUserProfileCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'userEdit', function($rootScope, $scope, $http, $sce, $state, userEdit) {
        $scope.page = {};
        $scope.user = userEdit;
        //if($rootScope.user === undefined) {$state.go('login');}
    }])
;