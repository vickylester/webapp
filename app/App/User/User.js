'use strict';

angular.module('transcript.app.user', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.user', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>'
                }
            },
            url: '/user'
        })
    }])

    .service('UserService', function($http, $rootScope, $cookies) {
        return {
            getUsers: function() {
                return $http.get($rootScope.api+"/users").then(function(response) {
                    return response.data;
                });
            },
            getUser: function(id) {
                return $http.get($rootScope.api+"/users/"+id).then(function(response) {
                    return response.data;
                });
            },
            getCurrent: function() {
                if($cookies.get('transcript_security_token_access') !== undefined) {
                    // Loading OAuth data:
                    $rootScope.oauth = {
                        access_token: $cookies.get('transcript_security_token_access'),
                        token_type: $cookies.get('transcript_security_token_type'),
                        refresh_token: $cookies.get('transcript_security_token_refresh')
                    };

                    $http.get($rootScope.api+"/users?token="+$rootScope.oauth.access_token, { headers:  {
                        'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                    }
                    }).then(function (response) {
                        console.log(response.data);
                        $rootScope.user = response.data;
                        return response.data;
                    });
                } else {
                    return null;
                }
            }
        };
    })
;