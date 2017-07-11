'use strict';

angular.module('transcript.app.security', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.security', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>'
                }
            },
            url: '/security'
        })
    }])
;