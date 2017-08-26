'use strict';

angular.module('transcript.admin.thesaurus.access', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.thesaurus.access', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Thesaurus/Access/Access.html',
                    controller: 'AdminThesaurusAccessCtrl'
                }
            },
            url: '/access',
            ncyBreadcrumb: {
                parent: 'admin.home',
                label: 'Accès'
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

    .controller('AdminThesaurusAccessCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'accesses', 'AccessService', 'UserService', function($rootScope, $scope, $http, $sce, $state, accesses, AccessService, UserService) {
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
                return AccessService.patchAccess({isThesaurusAccess: true, thesaurusRequest: null}, access.id)
                    .then(function(data) {
                        setRole(access);
                    });
            }
            function setRole(access) {
                return UserService.setRole("ROLE_THESAURUS_EDIT", access.user).then(function(data) {
                    $state.reload();
                });
            }
        };
        $scope.submit.reject.action = function(access) {
            $scope.submit.reject.loading = true;
            patchAccessRefuse(access);

            function patchAccessRefuse(access) {
                return AccessService.patchAccess({isThesaurusAccess: false, thesaurusRequest: null}, access.id)
                    .then(function(data) {
                        $state.reload();
                    });
            }
        };
    }])

    .filter('filterThesaurusAsk', function() {
        return function(accesses) {
            let accessArray = [];

            for(let i in accesses) {
                if(accesses[i].thesaurus_request !== null) {
                    accessArray.push(accesses[i]);
                }
            }

            return accessArray;
        };
    })
;