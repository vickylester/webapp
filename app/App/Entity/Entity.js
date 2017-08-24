'use strict';

angular.module('transcript.app.entity', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.entity', {
            views: {
                "page" : {
                    templateUrl: 'App/Entity/Entity.html',
                    controller: 'AppEntityCtrl'
                }
            },
            ncyBreadcrumb: {
                parent: 'app.home',
                label: '{{ entity.will.title }}'
            },
            url: '/entity/{id}',
            resolve: {
                entity: function(EntityService, $transition$) {
                    return EntityService.getEntity($transition$.params().id);
                }
            }
        })
    }])

    .service('EntityService', function($http, $rootScope) {
        return {
            getEntities: function() {
                return $http.get($rootScope.api+"/entities").then(function(response) {
                    return response.data;
                });
            },

            getEntity: function(id) {
                return $http.get($rootScope.api+"/entities/"+id).then(function(response) {
                    return response.data;
                });
            },

            postEntity: function(data) {
                return $http.post($rootScope.api+"/entities", data,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                });
            },

            removeEntity: function(id) {
                return $http.delete($rootScope.api+"/entities/"+id,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                });
            },

            postWill: function(data) {
                return $http.post($rootScope.api+"/wills", data,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                });
            },

            getResource: function(id_transcript) {
                return $http.get($rootScope.api+"/resources?transcript="+id_transcript,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
            },

            postResource: function(resource) {
                return $http.post($rootScope.api+"/resources", resource,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
            },

            exportEntity: function(id) {
                return $http.get($rootScope.api+"/xml?context=export&type=entity&id="+id).then(function(response) {
                    return response.data;
                });
            }
        };
    })

    .controller('AppEntityCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'EntityService', function($rootScope, $scope, $http, $sce, $state, entity, EntityService) {
        $scope.page = {
            loading: true
        };
        $scope.entity = entity;
        console.log(entity);

        $scope.getResourceClassLabel = function(resource) {
            if(resource.transcript.status === "todo") {return "label-danger";}
            else if(resource.transcript.status === "transcription") {return "label-warning";}
            else if(resource.transcript.status === "validation") {return "label-info";}
            else if(resource.transcript.status === "validated") {return "label-success";}
            else{return "label-danger";}
        };
        $scope.getResourceLabel = function(resource) {
            if(resource.transcript.status === "todo") {return "À faire";}
            else if(resource.transcript.status === "transcription") {return "En cours";}
            else if(resource.transcript.status === "validation") {return "Validation";}
            else if(resource.transcript.status === "validated") {return "Validée";}
            else{return "label-danger";}
        };


        /* -- Admin management -- */
        $scope.admin = {
            export: {
                show: false,
                submit: {
                    loading: false,
                    result: false,
                    content: ""
                },
                form: {

                }
            }
        };

        function adminInit() {
            $scope.admin.export.show = false;
        }

        $scope.admin.export.load = function() {
            if($scope.admin.export.show === false) {
                adminInit();
                $scope.admin.export.show = true;
            } else if($scope.admin.export.show === true) {
                $scope.admin.export.show = false;
            }
        };

        $scope.admin.export.submit.action = function() {
            $scope.admin.export.submit.loading = true;
            EntityService.exportEntity(entity.id).then(function(response) {
                console.log(response);
                $scope.admin.export.submit.loading = false;
                $scope.admin.export.submit.result = true;
                $scope.admin.export.submit.content = response.link;
            }, function errorCallback(response) {
                $scope.admin.export.submit.loading = false;
                console.log(response);
            });
        };
    }])
;