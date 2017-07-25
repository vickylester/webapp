'use strict';

angular.module('transcript.admin.entity.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.entity.edit', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Entity/Edit/Edit.html',
                    controller: 'AdminEntityEditCtrl'
                }
            },
            url: '/edit/:id',
            resolve: {
                entity: function(EntityService, $transition$) {
                    return EntityService.getEntity($transition$.params().id);
                }
            }
        })
    }])

    .controller('AdminEntityEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'flash', 'EntityService', function($rootScope, $scope, $http, $sce, $state, entity, flash, EntityService) {
        if(entity === null) {$state.go('error.404');}
        else {$scope.entity = entity;}
        console.log($scope.entity);

        $scope.submit = {
            loading: false
        };
        $scope.remove = {
            loading: false
        };
        $scope.form = {};

        /* Loading datepicker toogles */
        $(function () {
            $('.datepicker').datetimepicker({
                locale: 'fr',
                format: 'DD/MM/YYYY',
                showClear: true
            });
        });

        $scope.form.addResource = function(resourceNumber) {
            $scope.entity.resources.push({
                type: '',
                order_in_will: resourceNumber+1,
                images: '',
                notes: ''
            });
        };

        $scope.form.removeResource = function(resource) {
            let index =$scope.entity.resources.indexOf(resource);
            $scope.entity.resources.splice(index,1);
        };

        /**
         * Submit management
         */
        $scope.submit.action = function() {
            $scope.submit.loading = true;
            let formEntity = {
                    willNumber: $scope.entity.will_number,
                    will: {
                        title: "Testament "+$scope.entity.will.call_number,
                        callNumber: $scope.entity.will.call_number,
                        minuteDate: new Date($scope.entity.will.minute_date),
                        willWritingDate: new Date($scope.entity.will.will_writing_date),
                        willWritingPlace: $scope.entity.will.will_writing_place
                    },
                    resources: []
                };

            for(let resource of $scope.entity.resources) {
                if(typeof resource.images === 'string') {
                    resource.images = resource.images.split(",");
                }
                let content = {
                    type: resource.type,
                    orderInWill: resource.order_in_will,
                    notes: resource.notes,
                    images: resource.images
                };
                if(resource.id === undefined) {
                    content['transcript'] = {
                        status: 'todo',
                        updateComment: 'Creation of the transcript'
                    };
                }

                formEntity.resources.push(content);
            }

            // Entity update :
            $http.patch($rootScope.api+'/entities/'+$scope.entity.id, formEntity, {
                headers:  {
                    'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
            }).then(function (response) {
                console.log(response.data);
                $scope.submit.loading = true;
                $state.go('app.entity', {id: response.data.id});
            }, function errorCallback(response) {
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
                $scope.submit.loading = false;
                console.log(response);
            });
        };

        /**
         * Remove entity
         * */
        $scope.remove.action = function() {
            $scope.remove.loading = true;
            removeEntity();

            function removeEntity() {
                return EntityService.removeEntity($scope.entity.id).
                then(function(data) {
                    $scope.remove.loading = false;
                    $state.go('admin.entity.list');
                }, function errorCallback(response) {
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
                    $scope.remove.loading = false;
                    console.log(response);
                });
            }
        };
    }])
;