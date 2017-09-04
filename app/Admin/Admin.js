'use strict';

angular.module('transcript.admin', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>'
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
;