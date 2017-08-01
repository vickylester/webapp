'use strict';

angular.module('transcript.admin.preference', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('admin.preference', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/AppPreference/AppPreference.html',
                        controller: 'AdminAppPreferenceCtrl'
                    }
                },
                url: '/preferences',
                ncyBreadcrumb: {
                    parent: 'admin.home',
                    label: 'Préférence système'
                }
            })
    }])

    .controller('AdminAppPreferenceCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'AppService', function($rootScope, $scope, $http, $sce, $state, flash, AppService) {
        $scope.submit = {
            loading: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;
            patchPreference();

            function patchPreference() {
                return AppService.patchPreference(
                    $rootScope.preferences.id,
                    {
                        projectTitle : $rootScope.preferences.project_title,
                        helpHomeContent : $rootScope.preferences.help_home_content,
                        helpInsideHomeContent : $rootScope.preferences.help_inside_home_content,
                        discoverHomeContent : $rootScope.preferences.discover_home_content,
                    }
                ).then(function(data) {
                    $rootScope.preferences = data;
                    $scope.submit.loading = false;
                    $state.go('admin.home');
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    if(response.data.code === 400) {
                        flash.error = "<ul>";
                        for(let field of response.data.errors.children) {
                            for(let error of field) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+error+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                        flash.error = $sce.trustAsHtml(flash.error);
                    }
                    console.log(response);
                });
            }
        };

    }])
;