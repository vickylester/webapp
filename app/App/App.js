'use strict';

angular.module('transcript.app', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app', {
            abstract: true,
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    template: '<div ui-view="page">' +
                    '               <div class="my-super-awesome-loading-box" data-ng-show="loadingTracker.active()">\n' +
                    '                   <div class="text-center"><i class="fa fa-spin fa-circle-o-notch fa-4x"></i></div>\n' +
                    '               </div>' +
                    '           </div>',
                    controller: 'AppCtrl'
                },
                "footer" : {
                    templateUrl: 'System/Footer/Footer.html',
                    controller: 'SystemFooterCtrl'
                }
            },
            url: '',
            resolve: {
                appPreference: function(AppService) {
                    return AppService.getPreference();
                },
                user: function(UserService) {
                    return UserService.getCurrent();
                }
            }
        })
    }])

    .service('AppService', function($http, $rootScope) {
        return {
            getPreference: function() {
                return $http.get($rootScope.api+"/app-preference").then(function(response) {
                    return response.data[0];
                });
            },
            patchPreference: function(id,data) {
                return $http.patch($rootScope.api+"/app-preference/"+id, data, { headers:  {
                    'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
                }).then(function(response) {
                    return response.data;
                });
            }
        };
    })

    .controller('AppCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'user', 'appPreference', function($rootScope, $scope, $http, $sce, $state, user, appPreference) {
        if (user !== null) {
            if($rootScope.user === undefined) {
                $rootScope.user = user;
            }

            console.log($rootScope.user);
            if ($rootScope.user !== undefined) {
                if($.inArray("ROLE_ADMIN", $rootScope.user.roles) !== -1) {
                    $rootScope.user.isAdmin = true;
                } else {
                    $rootScope.user.isAdmin = false;
                }
            }
        }
        console.log(appPreference);
        $rootScope.preferences = appPreference;
    }])
;