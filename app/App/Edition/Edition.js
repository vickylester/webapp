'use strict';

angular.module('transcript.app.edition', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.edition', {
            views: {
                "page" : {
                    templateUrl: 'App/Edition/Edition.html',
                    controller: 'AppEditionCtrl'
                },
                "comment@transcript.app.edition" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            ncyBreadcrumb: {
                parent: 'transcript.app.entity({id: entity.id})',
                label: '{{ resource.type | ucfirst }} {{resource.orderInWill}}'
            },
            tfMetaTags: {
                title: '{{ resource.type | ucfirst }} {{resource.orderInWill}} de {{ entity.will.title }}',
            },
            url: '/edition/:idEntity/:idResource',
            resolve: {
                entity: function(EntityService, $transition$) {
                    return EntityService.getEntity($transition$.params().idEntity);
                },
                thread: function(CommentService, $transition$) {
                    return CommentService.getThread('transcript-'+$transition$.params().idResource);
                },
                config: function() {
                    return YAML.load('App/Transcript/toolbar.yml');
                }
            }
        })
    }])

    .controller('AppEditionCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$transition$', 'ResourceService', 'UserService', 'TranscriptService', 'entity', 'config', function($rootScope, $scope, $http, $sce, $state, $transition$, ResourceService, UserService, TranscriptService, entity, config) {
        $scope.entity = entity;
        $scope.resource = ResourceService.getResourceIntern($scope.entity, parseInt($transition$.params().idResource));
        $scope.role = TranscriptService.getTranscriptRights($rootScope.user);
        $scope.config = config;

        /* -- EncodedContent management ---------------------------------------------------- */
        if($scope.resource.transcript.content !== null) {
            let encodeLiveRender = $scope.resource.transcript.content;
            for (let buttonId in $scope.config.tags) {
                encodeLiveRender = TranscriptService.encodeHTML(encodeLiveRender, $scope.config.tags[buttonId]);
            }
            $scope.encodedContent = $sce.trustAsHtml(encodeLiveRender);
        }
        /* -- EncodedContent management ---------------------------------------------------- */

        /* -- Contributors management ------------------------------------------------------ */
        function getUser(username) {
            return UserService.getUserByUsername(username).then(function(data) {
                $scope.contributors.push({
                    user: data,
                    contributionsNumber: ResourceService.getContributionsNumberByUser($scope.resource, data)
                });
            });
        }

        $scope.contributors = [];
        let contributors = ResourceService.getContributors($scope.resource);
        for(let id in contributors) {
            getUser(contributors[id]);
        }
        /* -- Contributors management ------------------------------------------------------ */

        /* -- Modal Login management ------------------------------------------------------- */
        $scope.goRegister = function() {
            $('#loginModal').modal('hide');
            $state.go('transcript.app.security.register');
        };
        $scope.goLogin = function() {
            $('#loginModal').modal('hide');
            $state.go('transcript.app.security.login');
        };
        /* -- Modal Login management ------------------------------------------------------- */

        /* -- Admin management ------------------------------------------------------------- */
        $scope.admin = {
            status: {
                loading: false
            }
        };
        $scope.admin.status.action = function(state) {
            $scope.admin.status.loading = true;

            return TranscriptService.patchTranscript({status: state, updateComment: "Changing status to "+state}, $scope.resource.transcript.id).then(function(data) {
                $scope.resource.transcript.status = data.status;
                $scope.admin.status.loading = false;
            });
        };
        /* -- Admin management ------------------------------------------------------------- */
    }])
;