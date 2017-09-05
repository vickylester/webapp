'use strict';

angular.module('transcript.app.user.private-message', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.private-message', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>'
                }
            },
            url: '/messages'
        })
    }])

;