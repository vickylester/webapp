'use strict';

angular.module('transcript.admin.content.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.content.new', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Content/Edit/Edit.html',
                        controller: 'AdminContentEditCtrl'
                    }
                },
                url: '/new',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.content.list',
                    label: 'Nouveau contenu'
                },
                tfMetaTags: {
                    title: 'Nouveau',
                },
                resolve: {
                    content: function() {
                        return null;
                    }
                }
            })
            .state('transcript.admin.content.edit', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Content/Edit/Edit.html',
                        controller: 'AdminContentEditCtrl'
                    }
                },
                url: '/edit/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.app.content({id: content.id})',
                    label: 'Modification'
                },
                tfMetaTags: {
                    title: '{{ content.title }} - Modification',
                },
                resolve: {
                    content: function(ContentService, $transition$) {
                        return ContentService.getContent($transition$.params().id, false);
                    }
                }
            })
    }])

    .controller('AdminContentEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'content', 'CommentService', 'flash', function($rootScope, $scope, $http, $sce, $state, content, CommentService, flash) {
        if(content !== null) {
            console.log(content);
            $scope.content = content;
            $scope.content.updateComment = "";
            if($scope.content.onHomepage === true) { $scope.content.onHomepage = 1; }
            if($scope.content.onHomepage === false) { $scope.content.onHomepage = 0; }

            if(content.tags !== null) {$scope.content.tags = content.tags.join(', ');}
        } else {
            $scope.content = {
                id: null,
                title: null,
                content: null,
                status: null,
                type: null,
                onHomepage: 0,
                updateComment: "Creation of the content",
                tags: null,
                illustration: null
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

            let tagEncode = null;
            if($scope.content.tags !== null) {
                let tagEncode = $scope.content.tags.split(',');
                if ($scope.content.tags.indexOf(',') !== -1) {
                    tagEncode = [$scope.content.tags];
                }
            }

            let form = {
                title: $scope.content.title,
                content: $scope.content.content,
                type: $scope.content.type,
                status: $scope.content.status,
                onHomepage: $scope.content.onHomepage,
                updateComment: $scope.content.updateComment,
                tags: tagEncode,
                illustration: $scope.content.illustration
            };
            if($scope.content.id === null) {
                /* If content.id == null > The content doesn't exist, we post it */
                $http.post($rootScope.api+'/contents', form).
                then(function (response) {
                    console.log(response.data);
                    $scope.thread = CommentService.postThread('content-'+response.data.id);
                    flash.success = "Votre contenu a bien été créé";
                    flash.success = $sce.trustAsHtml(flash.success);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    $state.go('transcript.app.content', {id: response.data.id});
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
            } else if($scope.content.id !== null) {
                /* If content.id != null > The content already exists, we just patch it */
                $http.patch($rootScope.api+'/contents/'+$scope.content.id, form).
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
            $http.delete($rootScope.api+'/contents/'+$scope.content.id).
            then(function (response) {
                flash.success = "Votre contenu a bien été supprimé";
                flash.success = $sce.trustAsHtml(flash.success);
                $scope.submit.loading = false;
                $state.go('transcript.admin.content.list');
            }, function errorCallback(response) {
                $scope.validation.loading = false;
                console.log(response);
            });

        };

        $(document).on('ready', function() {
            $("#admin-content-edit-image").fileinput({'showUpload':false, 'previewFileType':'any'});
        });
    }])
;