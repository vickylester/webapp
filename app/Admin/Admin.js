'use strict';

angular.module('transcript.admin', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminCtrl'
                }
            },
            url: '/admin',
            data: {
                permissions: {
                    only: 'adminAccess',
                    redirectTo: {
                        adminAccess: 'transcript.error.403'
                    }
                }
            }
        })
    }])

    .controller('AdminCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', 'appPreference', 'tfMetaTags', function($rootScope, $scope, $http, $sce, $state, user, appPreference, tfMetaTags) {
        tfMetaTags.setTitleSuffix(' | Administration '+tfMetaTags.getTitleSuffix());
    }])
;