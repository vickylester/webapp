'use strict';

angular.module('transcript.service.user', ['ui.router'])

    .service('UserService', function($http, $rootScope, $cookies, $state, $sce, flash) {
        return {
            getUsers: function(profile) {
                return $http.get($rootScope.api+"/users?profile="+profile, { headers:  {
                    'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
                }).then(function(response) {
                    return response.data;
                });
            },
            getUserByUsername: function(username, profile) {
                return $http.get($rootScope.api+"/users?username="+username+"&profile="+profile).then(function(response) {
                    return response.data;
                });
            },
            getUser: function(id, profile) {
                return $http.get($rootScope.api+"/users/"+id+"?profile="+profile).then(function(response) {
                    return response.data;
                });
            },
            getPreferences: function(id) {
                return $http.get($rootScope.api+"/preferences?user="+id, { headers:  {
                    'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
                }).then(function(response) {
                    return response.data;
                });
            },
            getCurrent: function() {
                if($rootScope.user !== undefined) {return $rootScope.user;}
                else if($cookies.get('transcript_security_token_access') !== undefined) {
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
            },
            confirm: function(token) {
                return $http.get($rootScope.api+"/users/confirmation/"+token).then(function(response) {
                    return {"code": 200, "message": response.data};
                }, function errorCallback(response) {
                    return {"code": response.data.code, "message": response.data.message};
                });
            },
            login: function(form, routing) {
                return $http.post($rootScope.api+"/oauth/v2/token", form)
                    .then(function (response) {
                        console.log(response.data);
                        $rootScope.oauth = response.data;
                        $rootScope.oauth.token_type = capitalizeFirstLetter($rootScope.oauth.token_type);
                        $cookies.put('transcript_security_token_access', $rootScope.oauth.access_token);
                        $cookies.put('transcript_security_token_type', $rootScope.oauth.token_type);
                        $cookies.put('transcript_security_token_refresh', $rootScope.oauth.refresh_token);

                        // Loading user's data:
                        $http.get($rootScope.api+"/users?token="+$rootScope.oauth.access_token,
                            { headers:  {
                                'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                            }
                            })
                            .then(function (response) {
                                console.log(response.data);
                                $rootScope.user = response.data;
                                $state.go(routing);
                            });
                    }, function errorCallback(response) {
                        console.log(response);
                        if(response.data.code === 400) {
                            flash.error = "<ul>";
                            for(let field of response.data.errors.children) {
                                for(let error of field) {
                                    if(error === "errors") {
                                        flash.error += "<li><strong>"+field+"</strong> : "+error+"</li>";
                                    }
                                }
                            }
                            flash.error += "</ul>";
                            flash.error = $sce.trustAsHtml(flash.error);
                        }
                        if(response.status === 400 || response.data.error_description !== undefined) {
                            flash.error = $sce.trustAsHtml("<ul><li>Warning: "+response.data.error_description+"</li></ul>");
                        }
                        return false;
                    });
            },
            askReset: function(username) {
                return $http.post($rootScope.api+"/users/resetting/send/"+username)
                    .then(function (response) {
                        console.log(response.data);
                        return true;
                    }, function errorCallback(response) {
                        console.log(response);
                        return false;
                    });
            },
            sendReset: function(token, first, second) {
                return $http.post($rootScope.api+"/users/resetting/reset/"+token, {'fos_user_resetting_form': {'plainPassword': {'first': first, 'second': second}}})
                    .then(function (response) {
                        console.log(response.data);
                        return true;
                    }, function errorCallback(response) {
                        console.log(response);
                        return false;
                    });
            },
            changePassword: function(current, first, second) {
                return $http.post($rootScope.api+"/users/password/change",
                    {'fos_user_change_password_form': {'current_password': current, 'plainPassword': {'first': first, 'second': second}}},
                    { headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
                )
                    .then(function (response) {
                        console.log(response.data);
                        return true;
                    }, function errorCallback(response) {
                        console.log(response);
                        return false;
                    });
            },
            setRole: function(role, user) {
                return $http.post($rootScope.api+"/users/"+user.id+"/roles",
                    {role: role},
                    { headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
                )
                    .then(function (response) {
                        console.log(response.data);
                        return true;
                    }, function errorCallback(response) {
                        console.log(response);
                        return false;
                    });
            }
        };
    })

;