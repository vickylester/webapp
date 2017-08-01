'use strict';

angular.module('transcript.admin.user.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.user.view', {
            views: {
                "page" : {
                    templateUrl: 'Admin/User/View/View.html',
                    controller: 'AdminUserViewCtrl'
                }
            },
            url: '/{id}',
            ncyBreadcrumb: {
                parent: 'admin.user.list',
                label: 'Edition de {{ iUser.name }}'
            },
            resolve: {
                user: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().id);
                }
            }
        })
    }])

    .controller('AdminUserViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', function($rootScope, $scope, $http, $sce, $state, user) {
        $scope.iUser = user;
        $scope.roles = {
            submit: {
                isLoading: false
            }
        };

        $scope.roles.submit.action = function() {
            $scope.roles.submit.isLoading = true;
            var form = {
                roles: $scope.iUser.roles
            };

            $http.patch($rootScope.api+'/users/'+$scope.iUser.id, form, {
                headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}
            }).then(function (response) {
                console.log(response.data);
                flash.success = "Les rôles ont bien été mis à jour";
                flash.success = $sce.trustAsHtml(flash.success);
                $scope.roles.submit.isLoading = false;
            }, function errorCallback(response) {
                if(response.data.code === 400) {
                    flash.error = "<ul>";
                    for(var field in response.data.errors.children) {
                        for(var error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                    flash.error = $sce.trustAsHtml(flash.error);
                }
                console.log(response);
                $scope.roles.submit.isLoading = false;
            });
        };
    }])
;