'use strict';

angular.module('transcript.admin.training.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.training.new', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Training/Edit/Edit.html',
                        controller: 'AdminTrainingEditCtrl'
                    }
                },
                url: '/new',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.training.list',
                    label: 'Nouvel élément d\'entrainement'
                },
                tfMetaTags: {
                    title: 'Nouveau',
                },
                resolve: {
                    trainingContent: function() {
                        return null;
                    },
                    trainingContents: function(TrainingContentService) {
                        return TrainingContentService.getTrainingContents(null, null);
                    }
                }
            })
            .state('transcript.admin.training.edit', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Training/Edit/Edit.html',
                        controller: 'AdminTrainingEditCtrl'
                    }
                },
                url: '/edit/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.app.training.view({id: content.id})',
                    label: 'Modification'
                },
                tfMetaTags: {
                    title: 'Modification',
                },
                resolve: {
                    trainingContent: function(TrainingContentService, $transition$) {
                        return TrainingContentService.getTrainingContent($transition$.params().id, false);
                    },
                    trainingContents: function(TrainingContentService) {
                        return TrainingContentService.getTrainingContents(null, null);
                    }
                }
            })
    }])

    .controller('AdminTrainingEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'trainingContent', 'trainingContents', 'flash', function($rootScope, $scope, $http, $sce, $state, trainingContent, trainingContents, flash) {
        $scope.trainingContents = trainingContents;
        if(trainingContent !== null) {
            console.log(trainingContent);
            $scope.trainingContent = trainingContent;
        } else {
            $scope.trainingContent = {
                title: null,
                orderInTraining: null,
                illustration: null,
                content: null,
                pageStatus: null,
                pageType: null,
                updateComment: "Creation of the content",
            };
        }

        $scope.submit = {
            loading: false,
            success: false
        };
        $scope.remove = {
            loading: false
        };
        $scope.options = {
            language: 'fr',
            allowedContent: true,
            entities: false,
            toolbar: [
                ['Source','NewPage','Print','Templates','-','Find','Replace','Scayt','RemoveFormat','-','Undo','Redo','-','Maximize','ShowBlocks'],
                ['Bold','Italic','Underline','StrikeThrough','Strike','Subscript','Superscript','-','NumberedList','BulletedList','Outdent','Indent','Blockquote','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','Link','Unlink','Anchor'],
                ['Image','Table','HorizontalRule','Smiley','SpecialChar','PageBreak','InsertPre'],
                ['Styles','Format','Font','FontSize','-','TextColor','BGColor']
            ]
        };

        /**
         * Submit management
         */
        $scope.submit.action = function() {
            $scope.submit.success = false;
            $scope.submit.loading = true;

            if($scope.trainingContent.id === null || $scope.trainingContent.id === undefined) {
                /* If trainingContent.id == null > The trainingContent doesn't exist, we post it */
                $http.post($rootScope.api+'/training-contents', $scope.trainingContent).
                then(function (response) {
                    console.log(response.data);
                    flash.success = "Votre contenu a bien été créé";
                    flash.success = $sce.trustAsHtml(flash.success);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    $state.go('transcript.app.training.view', {id: response.data.id});
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    if(response.data.code === 400) {
                        flash.error = "<ul>";
                        for(var field in response.data.errors.children) {
                            for(var error in response.data.errors.children[field]) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                        flash.error = $sce.trustAsHtml(flash.error);
                    }
                    console.log(response);
                });
            } else if($scope.trainingContent.id !== null && $scope.trainingContent.id !== undefined) {
                /* If content.id != null > The trainingContent already exists, we just patch it */
                $http.patch($rootScope.api+'/training-contents/'+$scope.trainingContent.id, form).
                then(function (response) {
                    console.log(response.data);
                    flash.success = "Votre contenu a bien été mis à jour";
                    flash.success = $sce.trustAsHtml(flash.success);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                }, function errorCallback(response) {
                    if(response.data.code === 400) {
                        flash.error = "<ul>";
                        for(var field in response.data.errors.children) {
                            for(var error in response.data.errors.children[field]) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                        flash.error = $sce.trustAsHtml(flash.error);
                    }
                    $scope.submit.loading = false;
                    console.log(response);
                });
            }
        };

        /**
         * Submit management
         */
        $scope.remove.action = function() {
            $scope.remove.loading = true;
            $http.delete($rootScope.api+'/training-contents/'+$scope.trainingContent.id).
            then(function (response) {
                flash.success = "Votre contenu a bien été supprimé";
                flash.success = $sce.trustAsHtml(flash.success);
                $scope.submit.loading = false;
                $state.go('transcript.admin.training.list');
            }, function errorCallback(response) {
                $scope.validation.loading = false;
                console.log(response);
            });

        };
    }])
;