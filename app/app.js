'use strict';

angular.module('transcriptApp', [
    'ui.router',
    'ui.ace',
    'ngRoute',
    'ngCookies',
    'ckeditor',
    'transcript.admin',
    'transcript.admin.content',
    'transcript.admin.content.edit',
    'transcript.admin.content.list',
    'transcript.admin.content.view',
    'transcript.admin.entity',
    'transcript.admin.entity.edit',
    'transcript.admin.entity.import',
    'transcript.admin.entity.list',
    'transcript.admin.home',
    'transcript.admin.transcript',
    'transcript.admin.transcript.export',
    'transcript.admin.transcript.validation',
    'transcript.admin.user',
    'transcript.admin.user.list',
    'transcript.admin.user.view',
    'transcript.app',
    'transcript.app.home',
    'transcript.app.entity',
    'transcript.app.contact',
    'transcript.app.content',
    'transcript.app.security',
    'transcript.app.security.login',
    'transcript.app.security.register',
    'transcript.app.security.check',
    'transcript.app.security.confirm',
    'transcript.app.training',
    'transcript.app.transcript',
    'transcript.app.user',
    'transcript.app.user.profile',
    'transcript.app.user.edit',
    'transcript.system.navbar'
]).
config(['$stateProvider','$httpProvider', '$urlRouterProvider', '$qProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $qProvider) {
    $urlRouterProvider.otherwise('/');
    $qProvider.errorOnUnhandledRejections(false);
    $httpProvider.interceptors.push('authInterceptor');
}])
.run(['$rootScope', '$http', '$sce', '$state', '$cookieStore', '$injector', function($rootScope, $http, $sce, $state, $cookieStore, $injector) {
    /* Parameters */
    $rootScope.api = "http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php";
    /* Parameters */

    /* Token management */
    if($cookieStore.get('transcript_security_token') !== undefined && $rootScope.user === undefined) {
        $rootScope.user = false;
        //console.log($cookieStore.get('transcript_security_token'));
        $rootScope.access_token = $cookieStore.get('transcript_security_token');

        $http.get($rootScope.api+"/auth-token", { headers:  {
                'X-Auth-Token': $rootScope.access_token
            }
        })
            .then(function (response) {
                console.log(response.data);
                $rootScope.user = response.data;
            });
    }
    /* Token management */
}])
.factory('authInterceptor', authInterceptor);

function authInterceptor($rootScope, $q) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($rootScope.access_token) {
                config.headers['X-Auth-Token'] = $rootScope.access_token;
            } else {
                console.log("Loading token failed");
            }
            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                console.log("not authorised");
            }
            return $q.reject(rejection);
        }
    };
};