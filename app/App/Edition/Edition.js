'use strict';

angular.module('transcript.app.edition', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.edition', {
            views: {
                "page" : {
                    templateUrl: 'App/Edition/Edition.html',
                    controller: 'AppEditionCtrl'
                },
                "comment@app.edition" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            ncyBreadcrumb: {
                parent: 'app.entity({id: entity.id})',
                label: '{{ resource.type | ucfirst }} {{resource.order_in_will}}'
            },
            url: '/edition/:idEntity/:idResource',
            resolve: {
                entity: function(EntityService, $transition$) {
                    return EntityService.getEntity($transition$.params().idEntity);
                },
                thread: function(CommentService, $transition$) {
                    if(CommentService.getThread('transcript-'+$transition$.params().idResource) === null) {
                        CommentService.postThread('transcript-'+$transition$.params().idResource);
                        return CommentService.getThread('transcript-'+$transition$.params().idResource);
                    } else {
                        return CommentService.getThread('transcript-'+$transition$.params().idResource);
                    }
                }
            }
        })
    }])

    .controller('AppEditionCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$transition$', 'entity', 'ResourceService', 'UserService', 'TranscriptService', function($rootScope, $scope, $http, $sce, $state, $transition$, entity, ResourceService, UserService, TranscriptService) {
        $scope.entity = entity;
        $scope.resource = ResourceService.getResourceIntern($scope.entity, parseInt($transition$.params().idResource));
        $scope.role = TranscriptService.getTranscriptRights($rootScope.user);

        /* -- EncodedContent management ---------------------------------------------------- */
        let config = YAML.load('App/Transcript/toolbar.yml');
        if($scope.resource.transcript.content !== null) {
            let encodeLiveRender = $scope.resource.transcript.content;
            for (let buttonId in config.tei) {
                encodeLiveRender = TranscriptService.encodeHTML(encodeLiveRender, config.tei[buttonId]);
            }
            $scope.encodedContent = $sce.trustAsHtml(encodeLiveRender);
        }
        /* -- EncodedContent management ---------------------------------------------------- */

        /* -- Contributors management ---------------------------------------------------- */
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
        /* -- Contributors management ---------------------------------------------------- */
    }])
;