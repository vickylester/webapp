'use strict';

angular.module('transcript.admin.taxonomy.access', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.taxonomy.access', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Taxonomy/Access/Access.html',
                    controller: 'AdminTaxonomyAccessCtrl'
                }
            },
            url: '/access',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Accès'
            },
            tfMetaTags: {
                title: 'Accès',
            },
            resolve: {
                accesses: function(AccessService) {
                    return AccessService.getAccesses().then(function(data){
                        return data;
                    });
                }
            }
        })
    }])

    .controller('AdminTaxonomyAccessCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'accesses', 'AccessService', 'UserService', function($rootScope, $scope, $http, $sce, $state, accesses, AccessService, UserService) {
        $scope.accesses = accesses;
        $scope.submit = {
            valid: {
                loading: false
            },
            reject: {
                loading: false
            }
        };

        $scope.submit.valid.action = function(access) {
            $scope.submit.valid.loading = true;
            patchAccessAccept(access);

            function patchAccessAccept(access) {
                return AccessService.patchAccess({isTaxonomyAccess: true, taxonomyRequest: null}, access.id)
                    .then(function(data) {
                        setRole(access);
                    });
            }
            function setRole(access) {
                return UserService.setRole("ROLE_TAXONOMY_EDIT", access.user).then(function(data) {
                    $state.reload();
                });
            }
        };
        $scope.submit.reject.action = function(access) {
            $scope.submit.reject.loading = true;
            patchAccessRefuse(access);

            function patchAccessRefuse(access) {
                return AccessService.patchAccess({isTaxonomyAccess: false, taxonomyRequest: null}, access.id)
                    .then(function(data) {
                        $state.reload();
                    });
            }
        };
    }])

    .filter('filterTaxonomyAsk', function() {
        return function(accesses) {
            let accessArray = [];

            for(let i in accesses) {
                if(accesses[i].taxonomyRequest !== null) {
                    accessArray.push(accesses[i]);
                }
            }

            return accessArray;
        };
    })
;