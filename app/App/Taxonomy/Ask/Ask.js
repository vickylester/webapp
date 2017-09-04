'use strict';

angular.module('transcript.app.taxonomy.ask', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.taxonomy.ask', {
            views: {
                "page" : {
                    templateUrl: 'App/Taxonomy/Ask/Ask.html',
                    controller: 'AppTaxonomyAskCtrl'
                }
            },
            url: '/access',
            ncyBreadcrumb: {
                parent: 'transcript.app.taxonomy.home',
                label: 'Demande d\'accès'
            }
        })
    }])

    .controller('AppTaxonomyAskCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'AccessService', '$filter', function($rootScope, $scope, $http, $sce, $state, flash, AccessService, $filter) {
        if($rootScope.user === undefined) {$state.go('transcript.error.403');}
        if($filter('contains')($rootScope.user.roles, "ROLE_TAXONOMY_EDIT") === true) {$state.go('transcript.app.taxonomy.home');}

        $scope.context = 'ask';
        $scope.form = {
            taxonomyRequest: null
        };
        $scope.submit = {
            loading: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;
            patchAccess();
        };

        function patchAccess() {
            return AccessService.patchAccess($scope.form, $rootScope.user._embedded.accesses.id).then(function(data) {
                $scope.submit.loading = false;
                $scope.context = "sent";
                $rootScope.user._embedded.accesses = data;
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
    }])
;