'use strict';

angular.module('transcript.admin.content.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.content.view', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/Content/View/View.html',
                    controller: 'AdminContentViewCtrl'
                }
            },
            url: '/{id}',
            resolve: {
                content: function(ContentService, $transition$) {
                    return ContentService.getContent($transition$.params().id);
                }
            }
        })
    }])

    .controller('AdminContentViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'content', function($rootScope, $scope, $http, $sce, $state, content) {
        console.log(content);
        $scope.content = content;
    }])
;