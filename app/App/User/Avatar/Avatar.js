'use strict';

angular.module('transcript.app.user.avatar', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.avatar', {
            views: {
                "page" : {
                    templateUrl: 'App/User/Avatar/Avatar.html',
                    controller: 'AppUserAvatarCtrl'
                }
            },
            url: '/avatar/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: user.id})',
                label: 'Modification de l\'avatar'
            },
            tfMetaTags: {
                title: 'Modification de l\'avatar',
            },
            resolve: {
                userEdit: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().id);
                }
            }
        })
    }])

    .controller('AppUserAvatarCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'userEdit', 'flash', 'Upload', function($rootScope, $scope, $http, $sce, $state, userEdit, flash, Upload) {
        if($rootScope.user === undefined && $rootScope.user !== userEdit) {$state.go('transcript.app.security.login');}

        /* -- Breadcrumb management -------------------------------------------------------- */
        $scope.iUser = $rootScope.user;
        /* -- End : breadcrumb management -------------------------------------------------- */

        $scope.form = {
            picture: null
        };
        $scope.submit = {
            loading: false
        };

        /* Submit data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;

            Upload.upload = Upload.upload({
                url: $rootScope.api+"/users-avatar?id="+$rootScope.user.id,
                data: {picture: $scope.form.picture}
            }).then(function (response) {
                console.log(response);
                $scope.submit.loading = false;
                $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
            });
        };
    }])
;