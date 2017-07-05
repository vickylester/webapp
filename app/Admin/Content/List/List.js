'use strict';

angular.module('transcript.admin.content.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.content.list', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/Content/List/List.html',
                    controller: 'AdminContentListCtrl'
                }
            },
            url: '/list',
            resolve: {
                contents: function(ContentService, $transition$) {
                    return ContentService.getContents($transition$.params().id);
                }
            }
        })
    }])

    .controller('AdminContentListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'contents', function($rootScope, $scope, $http, $sce, $state, contents) {
        $scope.contents = contents;
    }])
;