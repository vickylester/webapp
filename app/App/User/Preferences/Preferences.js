'use strict';

angular.module('transcript.app.user.preferences', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.preferences', {
            views: {
                "page" : {
                    templateUrl: 'App/User/Preferences/Preferences.html',
                    controller: 'AppUserPreferencesCtrl'
                }
            },
            url: '/preferences/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: user.id})',
                label: 'Modification des préférences'
            },
            tfMetaTags: {
                title: 'Modification des préférences',
            },
            resolve: {
                userPreferences: function(UserPreferenceService, $transition$) {
                    return UserPreferenceService.getPreferences($transition$.params().id);
                }
            }
        })
    }])

    .controller('AppUserPreferencesCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'UserPreferenceService', 'userPreferences', 'flash', function($rootScope, $scope, $http, $sce, $state, UserPreferenceService, userPreferences, flash) {
        if($rootScope.user === undefined) {$state.go('transcript.app.security.login');}
        /* -- Breadcrumb management -------------------------------------------------------- */
        $scope.iUser = $rootScope.user;
        /* -- End : breadcrumb management -------------------------------------------------- */

        console.log(userPreferences);
        $scope.userPreferences = userPreferences;
        $scope.form = {
            transcriptionDeskPosition: $scope.userPreferences.transcriptionDeskPosition,
            smartTEI: $scope.userPreferences.smartTEI.toString()
        };
        $scope.submit = {
            loading: false
        };

        /* Submit data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;

            if($scope.form.smartTEI === "true") {$scope.form.smartTEI = true;}
            else if($scope.form.smartTEI === "false") {$scope.form.smartTEI = false;}

            return UserPreferenceService.patchPreferences(
                $scope.form, $scope.iUser.id
            ).then(function (response) {
                console.log(response);
                $rootScope.user._embedded.preferences = response;
                flash.success = $sce.trustAsHtml("<strong>Vos préférences ont bien été modifiées</strong>");
                $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
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