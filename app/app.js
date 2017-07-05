'use strict';

angular.module('transcriptApp', [
    'ui.router',
    'ui.ace',
    'ngRoute',
    'ngCookies',
    'ckeditor',
    'transcript.admin',
    'transcript.admin.home',
    'transcript.admin.content',
    'transcript.admin.content.edit',
    'transcript.admin.content.list',
    'transcript.admin.content.view',
    'transcript.app',
    'transcript.app.home',
    'transcript.app.entity',
    'transcript.app.transcript',
    'transcript.app.security.login',
    'transcript.app.security.register',
    'transcript.app.security.check',
    'transcript.app.security.confirm',
    'transcript.app.user',
    'transcript.app.user.profile',
    'transcript.app.user.edit',
    'transcript.system.navbar'
]).
config(['$stateProvider','$httpProvider', '$urlRouterProvider', '$qProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $qProvider) {
    $urlRouterProvider.otherwise('/');
    $qProvider.errorOnUnhandledRejections(false);

    // See https://engineering.talis.com/articles/elegant-api-auth-angular-js/
    /*$httpProvider.responseInterceptors.push([
        '$rootScope', '$q', '$injector','$location',
        function ($rootScope, $q, $injector, $location) {
            return function(promise) {
                return promise.then(function(response) {
                    return response; // no action, was successful
                }, function (response) {
                    // error - was it 401 or something else?
                    if (response.status===401 && response.data.error && response.data.error === "invalid_token") {
                        var deferred = $q.defer(); // defer until we can re-request a new token
                        // Get a new token... (cannot inject $http directly as will cause a circular ref)
                        $injector.get("$http").jsonp('/some/endpoint/that/reissues/tokens?cb=JSON_CALLBACK').then(function(loginResponse) {
                            if (loginResponse.data) {
                                $rootScope.oauth = loginResponse.data.oauth; // we have a new oauth token - set at $rootScope
                                // now let's retry the original request - transformRequest in .run() below will add the new OAuth token
                                $injector.get("$http")(response.config).then(function(response) {
                                    // we have a successful response - resolve it using deferred
                                    deferred.resolve(response);
                                },function(response) {
                                    deferred.reject(); // something went wrong
                                });
                            } else {
                                deferred.reject(); // login.json didn't give us data
                            }
                        }, function(response) {
                            deferred.reject(); // token retry failed, redirect so user can login again
                            $location.path('/user/sign/in');
                            return;
                        });
                        return deferred.promise; // return the deferred promise
                    }
                    return $q.reject(response); // not a recoverable error
                });
            };
        }]
    );*/
}])
.run(['$rootScope', '$http', '$sce', '$state', '$cookieStore', '$injector', function($rootScope, $http, $sce, $state, $cookieStore, $injector) {
    /* Parameters */
    $rootScope.api = "http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php";
    /* Parameters */


    $injector.get("$http").defaults.transformRequest = function(data, headersGetter) {
        //console.log($rootScope.access_token);
        if ($rootScope.access_token) headersGetter()['Authorization'] = "Bearer "+$rootScope.access_token;
        if (data) {
            return angular.toJson(data);
        }
    };

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
}]);
