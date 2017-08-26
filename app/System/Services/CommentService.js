'use strict';

angular.module('transcript.service.comment', ['ui.router'])

    .service('CommentService', function($http, $rootScope, $sce) {
        return {
            getThread: function(id) {
                return $http.get($rootScope.api+"/threads/"+id+"/comments").then(function(response) {
                    for(var comment in response.data.comments) {
                        response.data.comments[comment].comment.body = $sce.trustAsHtml(response.data.comments[comment].comment.body);
                    }
                    //console.log(response.data);
                    return response.data;
                }, function errorCallback(response) {
                    if(response.status === 404) {
                        return null;
                    } else {
                        console.log(response);
                        return null;
                    }
                });
            },
            postThread: function(id) {
                return $http.post($rootScope.api+"/threads",
                    {
                        "fos_comment_thread":
                            {
                                "id": id,
                                "permalink": $rootScope.siteURL+'/thread/'+id
                            }
                    },
                    {
                        headers:  {
                            'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                        }
                    }).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
            },
            postComment: function(id, content) {
                return $http.post($rootScope.api+"/threads/"+id+"/comments",
                    {
                        "fos_comment_comment":
                            {
                                "body": content
                            }
                    },
                    {
                        headers:  {
                            'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                        }
                    }).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
            }
        };
    })

;