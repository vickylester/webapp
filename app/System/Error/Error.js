'use strict';

angular.module('transcript.system.error', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('error', {
            abstract: true,
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    template: '<div ui-view="page"></div>'
                }
            },
            url: '/user'
        })
    }])
;