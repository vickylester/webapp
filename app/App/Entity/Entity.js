'use strict';

angular.module('transcript.app.entity', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.entity', {
            views: {
                "page" : {
                    templateUrl: 'App/Entity/Entity.html',
                    controller: 'AppEntityCtrl'
                },
                "comment@transcript.app.entity" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            ncyBreadcrumb: {
                parent: 'transcript.app.search',
                label: '{{ entity.will.title }}'
            },
            tfMetaTags: {
                title: '{{ entity.will.title }}',
            },
            url: '/entity/{id}',
            resolve: {
                entity: function(EntityService, $transition$) {
                    return EntityService.getEntity($transition$.params().id);
                },
                thread: function(CommentService, $transition$) {
                    return CommentService.getThread('entity-'+$transition$.params().id);
                }
            }
        })
    }])

    .controller('AppEntityCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'EntityService', 'UserService', function($rootScope, $scope, $http, $sce, $state, entity, EntityService, UserService) {
        function getUser(username) {
            return UserService.getUserByUsername(username).then(function(data) {
                $scope.contributors.push({
                    user: data,
                    contributionsNumber: EntityService.getContributionsNumberByUser($scope.entity, data)
                });
            });
        }

        $scope.page = {
            loading: true
        };
        $scope.entity = entity;
        console.log(entity);

        /* -- Contributors management ---------------------------------------------------- */
        $scope.contributors = [];
        let contributors = EntityService.getContributors($scope.entity);
        for(let id in contributors) {
            getUser(contributors[id]);
        }
        /* -- Contributors management ---------------------------------------------------- */

        /* -- Admin management ----------------------------------------------------------- */
        $scope.admin = {
            export: {
                show: false,
                submit: {
                    loading: false,
                    result: false,
                    content: ""
                },
                form: {

                }
            }
        };

        function adminInit() {
            $scope.admin.export.show = false;
        }

        $scope.admin.export.load = function() {
            if($scope.admin.export.show === false) {
                adminInit();
                $scope.admin.export.show = true;
            } else if($scope.admin.export.show === true) {
                $scope.admin.export.show = false;
            }
        };

        $scope.admin.export.submit.action = function() {
            $scope.admin.export.submit.loading = true;
            EntityService.exportEntity(entity.id).then(function(response) {
                console.log(response);
                $scope.admin.export.submit.loading = false;
                $scope.admin.export.submit.result = true;
                $scope.admin.export.submit.content = response.link;
            }, function errorCallback(response) {
                $scope.admin.export.submit.loading = false;
                console.log(response);
            });
        };
        /* -- Admin management ----------------------------------------------------------- */
    }])
;