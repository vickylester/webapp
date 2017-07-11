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
    'transcript.app.security.check',
    'transcript.app.security.confirm',
    'transcript.app.security.login',
    'transcript.app.security.logout',
    'transcript.app.security.register',
    'transcript.app.training',
    'transcript.app.transcript',
    'transcript.app.user',
    'transcript.app.user.profile',
    'transcript.app.user.edit',
    'transcript.system.navbar',
    'transcript.system.error',
    'transcript.system.error.403',
    'transcript.system.error.404'
]).
config(['$stateProvider','$httpProvider', '$urlRouterProvider', '$qProvider', '$injector', function($stateProvider, $httpProvider, $urlRouterProvider, $qProvider, $injector) {
    $urlRouterProvider.otherwise('/');
    $qProvider.errorOnUnhandledRejections(false);
    $httpProvider.interceptors.push('authInterceptor');

    $httpProvider.interceptors.push([
        '$rootScope', '$q', '$injector','$location',
        function ($rootScope, $q, $injector, $location, $state, $cookies) {
            return function(promise) {
                return promise.then(function(response) {
                    return response; // no action, was successful
                }, function (response) {
                    // error - was it 401 or something else?
                    if (response.status===401 && response.data.error && response.data.error === "invalid_token") {
                        var deferred = $q.defer(); // defer until we can re-request a new token
                        // Get a new token... (cannot inject $http directly as will cause a circular ref)
                        $injector.get("$http").post($rootScope.api+"/oauth/v2/token",
                            {
                                refresh_token: $rootScope.oauth.refresh_token,
                                grant_type: "refresh_token",
                                client_id: "1_3bcbxd9e24g0gk4swg0kwgcwg4o8k8g4g888kwc44gcc0gwwk4",
                                client_secret: "4ok2x70rlfokc8g0wws8c8kwcokw80k44sg48goc0ok4w0so0k"
                            }).then(function(loginResponse) {
                            if (loginResponse.data) {
                                $rootScope.oauth = loginResponse.data.oauth; // we have a new oauth token - set at $rootScope
                                $rootScope.oauth.token_type = capitalizeFirstLetter($rootScope.oauth.token_type);
                                $cookies.put('transcript_security_token_access', $rootScope.oauth.access_token);
                                $cookies.put('transcript_security_token_type', $rootScope.oauth.token_type);
                                $cookies.put('transcript_security_token_refresh', $rootScope.oauth.refresh_token);
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
                            $state.go('app.security.login');
                            return;
                        });
                        return deferred.promise; // return the deferred promise
                    }
                    return $q.reject(response); // not a recoverable error
                });
            };
        }]
    );
}])
.run(['$rootScope', '$http', '$sce', '$state', '$cookies', '$injector', function($rootScope, $http, $sce, $state, $cookies, $injector) {
    /* Parameters */
    $rootScope.api = "http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php";
    /* Parameters */

    /* Token management */
    /*if($cookies.get('transcript_security_token_access') !== undefined && $rootScope.user === undefined) {
        $rootScope.user = false;

        // Loading OAuth data:
        $rootScope.oauth = {
            access_token: $cookies.get('transcript_security_token_access'),
            token_type: $cookies.get('transcript_security_token_type'),
            refresh_token: $cookies.get('transcript_security_token_refresh')
        };

        $http.get($rootScope.api+"/users?token="+$rootScope.oauth.access_token, { headers:  {
                'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
            }
        })
            .then(function (response) {
                console.log(response.data);
                $rootScope.user = response.data;
            });
    }*/
    /* Token management */
}])
.factory('authInterceptor', authInterceptor);
//.factory('refreshToken', refreshToken);

function authInterceptor($rootScope, $q) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($rootScope.oauth) {
                config.headers['Authorization'] = $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token;
            } else {
                console.log("Loading token failed");
            }
            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                if(rejection.data.error === 'invalid_grant') {
                    refreshToken();
                } else {
                    console.log("not authorised");
                }
            }
            return $q.reject(rejection);
        }
    };
}

/*function refreshToken($rootScope, $http, $cookies, $state) {
    $http.post($rootScope.api+"/oauth/v2/token",
        {
            refresh_token: $rootScope.oauth.refresh_token,
            grant_type: "refresh_token",
            client_id: "1_3bcbxd9e24g0gk4swg0kwgcwg4o8k8g4g888kwc44gcc0gwwk4",
            client_secret: "4ok2x70rlfokc8g0wws8c8kwcokw80k44sg48goc0ok4w0so0k"
        })
        .then(function (response) {
            console.log(response.data);
            $rootScope.oauth = response.data;
            $rootScope.oauth.token_type = capitalizeFirstLetter($rootScope.oauth.token_type);
            $cookies.put('transcript_security_token_access', $rootScope.oauth.access_token);
            $cookies.put('transcript_security_token_type', $rootScope.oauth.token_type);
            $cookies.put('transcript_security_token_refresh', $rootScope.oauth.refresh_token);
            $state.reload();
        }, function errorCallback(response) {
            console.log(response);
        });
}*/

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}