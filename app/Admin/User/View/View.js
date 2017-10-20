'use strict';

angular.module('transcript.admin.user.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.user.view', {
            views: {
                "page" : {
                    templateUrl: 'Admin/User/View/View.html',
                    controller: 'AdminUserViewCtrl'
                }
            },
            url: '/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.admin.user.list',
                label: 'Modification de {{ iUser.name }}'
            },
            tfMetaTags: {
                title: 'Modification de {{ iUser.name }}',
            },
            resolve: {
                user: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().id);
                }
            }
        })
    }])

    .controller('AdminUserViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', 'flash', function($rootScope, $scope, $http, $sce, $state, user, flash) {
        $scope.iUser = user;
        $scope.roles = {
            submit: {
                loading: false
            }
        };

        $scope.roles.submit.action = function() {
            $scope.roles.submit.loading = true;
            let form = {
                id: $scope.iUser.id,
                roles: $scope.iUser.roles,
                action: "set"
            };
            console.log(form);

            $http.post($rootScope.api+'/users/'+$scope.iUser.id+"/roles", form).
            then(function (response) {
                console.log(response.data);
                flash.success = $sce.trustAsHtml("Les rôles ont bien été mis à jour");
                $scope.roles.submit.loading = false;
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
                $scope.roles.submit.loading = false;
            });
        };
    }])
;