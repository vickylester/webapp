'use strict';

angular.module('transcriptApp', [
        'ui.router',
        'ui.ace',
        'ngRoute',
        'ngCookies',
        'ckeditor',
        'http-auth-interceptor',
        'angular-flash.service',
        'angular-flash.flash-alert-directive',
        'ui.bootstrap',
        'ui.openseadragon',
        'ncy-angular-breadcrumb',
        //'blueimp.fileupload',
        'angucomplete',
        'leaflet-directive',
        'angular.filter',
        'transcript.admin',
        'transcript.admin.content',
        'transcript.admin.content.edit',
        'transcript.admin.content.list',
        'transcript.admin.entity',
        'transcript.admin.entity.edit',
        'transcript.admin.entity.import',
        'transcript.admin.entity.list',
        'transcript.admin.home',
        'transcript.admin.preference',
        'transcript.admin.thesaurus',
        'transcript.admin.thesaurus.access',
        'transcript.admin.thesaurus.logs',
        'transcript.admin.transcript',
        'transcript.admin.transcript.export',
        'transcript.admin.transcript.validation',
        'transcript.admin.user',
        'transcript.admin.user.list',
        'transcript.admin.user.view',
        'transcript.app',
        'transcript.app.blog',
        'transcript.app.contact',
        'transcript.app.content',
        'transcript.app.edition',
        'transcript.app.entity',
        'transcript.app.home',
        'transcript.app.search',
        'transcript.app.security',
        'transcript.app.security.check',
        'transcript.app.security.confirm',
        'transcript.app.security.login',
        'transcript.app.security.logout',
        'transcript.app.security.register',
        'transcript.app.security.resetting',
        'transcript.app.security.resetting.check',
        'transcript.app.security.resetting.request',
        'transcript.app.security.resetting.reset',
        'transcript.app.thesaurus',
        'transcript.app.thesaurus.ask',
        'transcript.app.thesaurus.edit',
        'transcript.app.thesaurus.home',
        'transcript.app.thesaurus.list',
        'transcript.app.thesaurus.view',
        'transcript.app.training',
        'transcript.app.transcript',
        'transcript.app.user',
        'transcript.app.user.change-password',
        'transcript.app.user.edit',
        'transcript.app.user.preferences',
        'transcript.app.user.profile',
        'transcript.system.comment',
        'transcript.system.error',
        'transcript.system.error.403',
        'transcript.system.error.404',
        'transcript.system.footer',
        'transcript.system.navbar',
        'transcript.service.access',
        'transcript.service.comment',
        'transcript.service.contact',
        'transcript.service.content',
        'transcript.service.entity',
        'transcript.service.resource',
        'transcript.service.search',
        'transcript.service.thesaurus',
        'transcript.service.transcript',
        'transcript.service.user',
        'transcript.service.will'
    ]).
    config(['$stateProvider','$httpProvider', '$urlRouterProvider', '$qProvider', '$injector', 'flashProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $qProvider, $injector, flashProvider) {
        $urlRouterProvider.otherwise('/');
        $qProvider.errorOnUnhandledRejections(false);

        flashProvider.errorClassnames.push('alert-danger');
        flashProvider.warnClassnames.push('alert-warning');
        flashProvider.infoClassnames.push('alert-info');
        flashProvider.successClassnames.push('alert-success');

    }])
    .run(['$rootScope', '$http', '$injector', '$location', 'authService', '$state', '$cookies', function($rootScope, $http, $injector, $location, authService, $state, $cookies) {
        let parameters = YAML.load('parameters.yml');
        $rootScope.api = parameters.api;
        $rootScope.api_web = parameters.api_web;
        $rootScope.webapp = {
            strict: parameters.webapp.strict,
            resources: parameters.webapp.resources
        };
        $rootScope.siteURL = parameters.siteURL;
        $rootScope.client_id = parameters.client_id;
        $rootScope.client_secret = parameters.client_secret;

        if($cookies.get('transcript_security_token_access') !== undefined) {
            $rootScope.oauth = {
                access_token: $cookies.get('transcript_security_token_access'),
                refresh_token: $cookies.get('transcript_security_token_refresh'),
                token_type: $cookies.get('transcript_security_token_type')
            };
        }

        $rootScope.isAdmin = function() {
            if($rootScope.user === undefined) {return false;}

            return ($.inArray("ROLE_ADMIN", $rootScope.user.roles) !== -1);
        };
    }])
    .directive('compile', ['$compile', function ($compile) {
        return function (scope, element, attrs) {
            scope.$watch(
                function (scope) {
                    return scope.$eval(attrs.compile);
                },
                function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                }
            )
        }
    }])
    .directive( "mwConfirmClick", [
        function( ) {
            return {
                priority: -1,
                restrict: 'A',
                scope: { confirmFunction: "&mwConfirmClick" },
                link: function( scope, element, attrs ){
                    element.bind( 'click', function( e ){
                        // message defaults to "Are you sure?"
                        let message = attrs.mwConfirmClickMessage ? attrs.mwConfirmClickMessage : "Are you sure?";
                        // confirm() requires jQuery
                        if( confirm( message ) ) {
                            scope.confirmFunction();
                        }
                    });
                }
            }
        }
    ])
    .filter('classicDate', [function() {
        return function (dateStr) {
            let date = new Date(dateStr);
            let monthNames = [ 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre' ];


            return date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
        }
    }])
    .filter('organisationName', [function() {
        return function (organisationAbbr) {
            let organisationName = "";
            switch(organisationAbbr) {
                case "AN":
                    organisationName = "Archives nationales";
                    break;
                case "AD78":
                    organisationName = "Archives départementales des Yvelines";
                    break;
                default:
                    organisationName = "Organisation inconnue";
            }
            return organisationName;
        }
    }])
    .filter('transcriptionStatusName', [function() {
        return function (transcriptionStatusID) {
            let transcriptionStatusName = "";
            switch(transcriptionStatusID) {
                case "todo":
                    transcriptionStatusName = "À faire";
                    break;
                case "transcription":
                    transcriptionStatusName = "En cours";
                    break;
                case "validation":
                    transcriptionStatusName = "En validation";
                    break;
                case "validated":
                    transcriptionStatusName = "Validé";
                    break;
                default:
                    transcriptionStatusName = "Inconnu";
            }
            return transcriptionStatusName;
        }
    }])
    .filter('contentTypeName', [function() {
        return function (contentStatusId) {
            let contentTypeName = "";
            switch(contentStatusId) {
                case "blogContent":
                    contentTypeName = "Article";
                    break;
                case "helpContent":
                    contentTypeName = "Page d'aide";
                    break;
                case "staticContent":
                    contentTypeName = "Page";
                    break;
                default:
                    contentTypeName = "Inconnu";
            }
            return contentTypeName;
        }
    }]);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}