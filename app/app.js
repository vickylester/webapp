'use strict';

angular.module('transcriptApp', [
    'ui.router',
    'transcript.app.home',
    'transcript.app.security.login',
    'transcript.app.security.register',
    'transcript.app.security.check',
    'transcript.app.security.confirm',
    'transcript.system.navbar'
]).
config(['$stateProvider','$httpProvider', '$urlRouterProvider', '$qProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $qProvider) {
    $urlRouterProvider.otherwise('/home');
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
.run(['$rootScope', '$injector', function($rootScope, $injector) {
    $injector.get("$http").defaults.transformRequest = function(data, headersGetter) {
        if ($rootScope.access_token) headersGetter()['Authorization'] = "Bearer "+$rootScope.access_token;
        if (data) {
            return angular.toJson(data);
        }
    };
}]);
