'use strict';

angular.module('transcript.app.entity', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.entity', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/Entity/Entity.html',
                    controller: 'AppEntityCtrl'
                }
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
            }
        };
    })

    .controller('AppEntityCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', function($rootScope, $scope, $http, $sce, $state, entity) {
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

    }])
;