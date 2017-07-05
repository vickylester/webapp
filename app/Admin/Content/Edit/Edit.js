'use strict';

angular.module('transcript.admin.content.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('admin.content.new', {
                views: {
                    "navbar" : {
                        templateUrl: 'System/Navbar/Navbar.html',
                        controller: 'SystemNavbarCtrl'
                    },
                    "page" : {
                        templateUrl: 'Admin/Content/Edit/Edit.html',
                        controller: 'AdminContentEditCtrl'
                    }
                },
                url: '/new',
                resolve: {
                    content: function() {
                        return null;
                    }
                }
            })
            .state('admin.content.edit', {
                views: {
                    "navbar" : {
                        templateUrl: 'System/Navbar/Navbar.html',
                        controller: 'SystemNavbarCtrl'
                    },
                    "page" : {
                        templateUrl: 'Admin/Content/Edit/Edit.html',
                        controller: 'AdminContentEditCtrl'
                    }
                },
                url: '/edit/:id',
                resolve: {
                    content: function(ContentService, $transition$) {
                        return ContentService.getContent($transition$.params().id);
                    }
                }
            })
    }])

    .controller('AdminContentEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'content', function($rootScope, $scope, $http, $sce, $state, content) {
        if(content !== null) {
            $scope.content = content;
        } else {
            $scope.content = {
                title: null,
                content: null,
                status: null,
                type: null
            };
        }

        $scope.options = {
            language: 'fr',
            allowedContent: true,
            entities: false
        };
    }])
;