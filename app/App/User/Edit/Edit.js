'use strict';

angular.module('transcript.app.user.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.user.edit', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/User/Edit/Edit.html',
                    controller: 'AppUserEditCtrl'
                }
            },
            url: '/edit',
            requireLogin: true,
            resolve: {
                user: function(UserService) {
                    return UserService.getUser();
                }
            }
        })
    }])

    .controller('AppUserEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', function($rootScope, $scope, $http, $sce, $state, user) {
        $scope.page = {};
        $rootScope.user = user;
        if($rootScope.user === undefined) {$state.go('login');}

        $scope.form = {
            name: $rootScope.user.name,
            errors: []
        };

        /* Submit data */
        $scope.edit = function() {
            $scope.form.errors = [];
            $http.patch("http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/users/"+$rootScope.user.id,
                {
                    'name': $scope.form.name
                })
                .then(function (response) {
                    if(response.status === 200) {
                        $state.go('user.profile');
                    }
                }, function errorCallback(response) {
                    console.log(response);
                    if(response.data.code === 400) {
                        for(var field in response.data.errors.children) {
                            for(var error in response.data.errors.children[field]) {
                                if(error === "errors") {
                                    $scope.form.errors.push({field: field, error: response.data.errors.children[field][error]});
                                }
                            }
                        }
                    }
                });
        };
    }])
;