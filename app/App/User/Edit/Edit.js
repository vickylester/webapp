'use strict';

angular.module('transcript.app.user.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.edit', {
            views: {
                "page" : {
                    templateUrl: 'App/User/Edit/Edit.html',
                    controller: 'AppUserEditCtrl'
                }
            },
            url: '/edit/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: user.id})',
                label: 'Modification du profil'
            },
            tfMetaTags: {
                title: 'Modification du profil',
            },
            resolve: {
                userEdit: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().id);
                }
            }
        })
    }])

    .controller('AppUserEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'userEdit', 'flash', function($rootScope, $scope, $http, $sce, $state, userEdit, flash) {
        if($rootScope.user === undefined && $rootScope.user !== userEdit) {$state.go('transcript.app.security.login');}

        /* -- Breadcrumb management -------------------------------------------------------- */
        $scope.iUser = $rootScope.user;
        /* -- End : breadcrumb management -------------------------------------------------- */

        $scope.form = {
            name: $rootScope.user.name,
            biography: $rootScope.user.biography,
            picture: $rootScope.user.picture
        };
        $scope.submit = {
            loading: false
        };

        /* Submit data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;
            $http.patch($rootScope.api+"/users/"+$rootScope.user.id, $scope.form)
            .then(function (response) {
                if(response.status === 200) {
                    $state.go('transcript.app.user.profile', {id: userEdit.id});
                }
            }, function errorCallback(response) {
                console.log(response);
                if(response.data.code === 400) {
                    flash.error = "<ul>";
                    for(var field in response.data.errors.children) {
                        for(var error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li>"+field+" : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                    flash.error = $sce.trustAsHtml(flash.error);
                }
                $scope.submit.loading = false;
            });
        };
    }])
;