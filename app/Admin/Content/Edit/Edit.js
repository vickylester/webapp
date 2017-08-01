'use strict';

angular.module('transcript.admin.content.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('admin.content.new', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Content/Edit/Edit.html',
                        controller: 'AdminContentEditCtrl'
                    }
                },
                url: '/new',
                ncyBreadcrumb: {
                    parent: 'admin.content.list',
                    label: 'Nouveau contenu'
                },
                resolve: {
                    content: function() {
                        return null;
                    }
                }
            })
            .state('admin.content.edit', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Content/Edit/Edit.html',
                        controller: 'AdminContentEditCtrl'
                    }
                },
                url: '/edit/:id',
                ncyBreadcrumb: {
                    parent: 'app.content({id: content.id})',
                    label: 'Edition'
                },
                resolve: {
                    content: function(ContentService, $transition$) {
                        return ContentService.getContent($transition$.params().id, false);
                    }
                }
            })
    }])

    .controller('AdminContentEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'content', 'CommentService', 'flash', '$upload', function($rootScope, $scope, $http, $sce, $state, content, CommentService, flash, $upload) {
        if(content !== null) {
            $scope.content = content;
        } else {
            $scope.content = {
                id: null,
                title: null,
                content: null,
                status: null,
                type: null
            };
        }

        console.log($scope.content);
        $scope.submit = {
            isLoading: false
        };
        $scope.remove = {
            isLoading: false
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
            $upload.upload({
                url: $rootScope.api+'/images',
                method: 'POST',
                file: $scope.content.image
            });

            $scope.submit.isLoading = true;
            var form = {
                title: $scope.content.title,
                content: $scope.content.content,
                type: $scope.content.type,
                status: $scope.content.status
            };
            if($scope.content.id === null) {
                /* If content.id == null > The content doesn't exist, we post it */
                $http.post($rootScope.api+'/contents', form, {
                    headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}
                }).then(function (response) {
                    console.log(response.data);
                    $scope.thread = CommentService.postThread('content-'+response.data.id);
                    flash.success = "Votre contenu a bien été créé";
                    flash.success = $sce.trustAsHtml(flash.success);
                    $scope.submit.isLoading = false;
                    $state.go('app.content', {id: response.data.id});
                }, function errorCallback(response) {
                    $scope.submit.isLoading = false;
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
                $http.patch($rootScope.api+'/contents/'+$scope.content.id, form, {
                    headers:  {
                        'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                    }
                }).then(function (response) {
                    console.log(response.data);
                    flash.success = "Votre contenu a bien été mis à jour";
                    flash.success = $sce.trustAsHtml(flash.success);
                    $scope.submit.isLoading = false;
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
                    $scope.submit.isLoading = false;
                    console.log(response);
                });
            }
        };

        /**
         * Submit management
         */
        $scope.remove.action = function() {
            $scope.remove.isLoading = true;
            $http.delete($rootScope.api+'/contents/'+$scope.content.id, {
                headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}
            }).then(function (response) {
                flash.success = "Votre contenu a bien été supprimé";
                flash.success = $sce.trustAsHtml(flash.success);
                $scope.submit.isLoading = false;
                $state.go('admin.content.list');
            }, function errorCallback(response) {
                $scope.validation.isLoading = false;
                console.log(response);
            });

        };

        $(document).on('ready', function() {
            $("#admin-content-edit-image").fileinput({'showUpload':false, 'previewFileType':'any'});
        });
    }])
;