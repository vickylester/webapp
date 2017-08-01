'use strict';

angular.module('transcript.admin.content.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.content.list', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Content/List/List.html',
                    controller: 'AdminContentListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'admin.home',
                label: 'Liste des contenus'
            },
            resolve: {
                contents: function(ContentService) {
                    return ContentService.getContents(null, null, "DESC", 100);
                }
            }
        })
    }])

    .controller('AdminContentListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'contents', function($rootScope, $scope, $http, $sce, $state, contents) {
        $scope.contents = contents;
    }])
;