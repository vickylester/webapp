'use strict';

angular.module('transcript.app.user.preferences', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.user.preferences', {
            views: {
                "page" : {
                    templateUrl: 'App/User/Preferences/Preferences.html',
                    controller: 'AppUserPreferencesCtrl'
                }
            },
            url: '/preferences/{id}',
            ncyBreadcrumb: {
                parent: 'app.user.profile({id: user.id})',
                label: 'Préférences'
            },
            requireLogin: true,
            resolve: {
                userPreferences: function(UserService, $transition$) {
                    return UserService.getPreferences($transition$.params().id);
                }
            }
        })
    }])

    .controller('AppUserPreferencesCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'userPreferences', 'flash', function($rootScope, $scope, $http, $sce, $state, userPreferences, flash) {
        if($rootScope.user === undefined) {$state.go('login');}
        /* -- Breadcrumb management -------------------------------------------------------- */
        $scope.iUser = $rootScope.user;
        /* -- End : breadcrumb management -------------------------------------------------- */

        console.log(userPreferences);
        $scope.form = {
            transcription_desk_position: userPreferences.transcription_desk_position,
            errors: []
        };
        $scope.submit = {
            loading: false
        };

        /* Submit data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;
            $scope.form.errors = [];
            $http.patch($rootScope.api+"/preferences/"+userPreferences.id,
                {
                    'transcriptionDeskPosition': $scope.form.transcription_desk_position
                }, { headers:  {
                    'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
                })
                .then(function (response) {
                    $rootScope.user._embedded.preferences = response.data;
                    $state.go('app.user.profile', {id: $rootScope.user.id});
                    flash.success = "Vos préférences ont bien été modifiées";
                }, function errorCallback(response) {
                    console.log(response);
                    if(response.data.code === 400) {
                        flash.error = '<ul>';
                        for(var field in response.data.errors.children) {
                            for(var error in response.data.errors.children[field]) {
                                if(error === "errors") {
                                    flash.error += "<li>"+field+" : "+response.data.errors.children[field][error]+"</li>";
                                }
                            }
                        }
                        flash.error += '</ul>';
                        flash.error = $sce.trustAsHtml(flash.error);
                    }
                    $scope.submit.loading = false;
                });
        };
    }])
;