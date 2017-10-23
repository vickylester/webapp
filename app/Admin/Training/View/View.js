'use strict';

angular.module('transcript.admin.training.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.training.view', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Training/View/View.html',
                        controller: 'AdminTrainingViewCtrl'
                    },
                    "comment@transcript.admin.training.view" : {
                        templateUrl: 'System/Comment/tpl/Thread.html',
                        controller: 'SystemCommentCtrl'
                    }
                },
                url: '/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.training.list',
                    label: '{{ trainingContent.title }}'
                },
                tfMetaTags: {
                    title: '{{ trainingContent.title }}',
                },
                resolve: {
                    trainingContent: function(TrainingContentService, $transition$) {
                        return TrainingContentService.getTrainingContent($transition$.params().id, true);
                    },
                    thread: function(CommentService, $transition$) {
                            return CommentService.getThread('trainingContent-'+$transition$.params().id);
                    }
                }
            })
    }])

    .controller('AdminTrainingViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'trainingContent', 'Upload', function($rootScope, $scope, $http, $sce, $state, trainingContent, Upload) {
        $scope.trainingContent = trainingContent;
        //if($scope.trainingContent.videoContainer !== null) {$scope.trainingContent.videoContainer = $sce.trustAsHtml($scope.trainingContent.videoContainer);}

        /* Upload new media ----------------------------------------------------------------------------------------- */
        $scope.media = {
            form: {
                picture: null
            },
            submit: {
                loading: false
            }
        };

        /* Submit data */
        $scope.media.submit.action = function() {
            $scope.media.submit.loading = true;

            Upload.upload = Upload.upload({
                url: $rootScope.api+"/media-contents?type=TrainingContent&field=illustration&id="+$scope.trainingContent.id,
                data: {media: $scope.media.form.picture}
            }).then(function (response) {
                console.log(response);
                $scope.media.submit.loading = false;
                $scope.trainingContent.illustration = response.data.illustration;
            }, function errorCallback(error) {
                console.log(error);
                $scope.media.submit.loading = false;
            });
        };
        /* New: Upload new media ------------------------------------------------------------------------------------ */
    }])
;