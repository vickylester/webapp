'use strict';

angular.module('transcript.admin.content', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.content', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/Content/Content.html',
                    controller: 'AdminContentCtrl'
                }
            },
            url: '/contents'
        })
    }])

    .service('ContentService', function($http, $rootScope) {
        return {
            getContents: function() {
                return $http.get($rootScope.api+"/contents").then(function(response) {
                    return response.data;
                });
            },

            getContent: function(id) {
                return $http.get($rootScope.api+"/contents/"+id).then(function(response) {
                    return response.data;
                });
            }
        };
    })


    .controller('AdminContentCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;