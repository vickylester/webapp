'use strict';

angular.module('transcript.admin.preference', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.preference', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/AppPreference/AppPreference.html',
                        controller: 'AdminAppPreferenceCtrl'
                    }
                },
                url: '/preferences',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.home',
                    label: 'Préférences système'
                },
                tfMetaTags: {
                    title: 'Préférence système',
                }
            })
    }])

    .controller('AdminAppPreferenceCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'AppService', function($rootScope, $scope, $http, $sce, $state, flash, AppService) {
        $scope.submit = {
            loading: false
        };
        let id = $rootScope.preferences.id;
        $scope.preferences = $rootScope.preferences;
        delete $scope.preferences.id;
        delete $scope.preferences._links;

        $scope.submit.action = function() {
            $scope.submit.loading = true;
            patchPreference();

            function patchPreference() {
                if($scope.preferences.enableContact === null) {$scope.preferences.enableContact = false;}

                return AppService.patchPreference(id, $scope.preferences).
                then(function(data) {
                    $rootScope.preferences = data;
                    $scope.submit.loading = false;
                    $state.go('transcript.admin.home');
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