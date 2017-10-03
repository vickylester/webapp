'use strict';

angular.module('transcript.admin.entity.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.entity.edit', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Entity/Edit/Edit.html',
                    controller: 'AdminEntityEditCtrl'
                }
            },
            url: '/edit/:id',
            ncyBreadcrumb: {
                parent: 'transcript.app.entity({id: entity.id})',
                label: 'Modification'
            },
            tfMetaTags: {
                title: 'Modification',
            },
            resolve: {
                entity: function(EntityService, $transition$) {
                    return EntityService.getEntity($transition$.params().id);
                },
                places: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities('places');
                }
            }
        })
    }])

    .controller('AdminEntityEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entity', 'flash', 'EntityService', 'places', function($rootScope, $scope, $http, $sce, $state, entity, flash, EntityService, places) {
        if(entity === null) {$state.go('transcript.error.404');}
        else {$scope.entity = entity;}
        console.log($scope.entity);
        $scope.places = places;

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
                orderInWill: resourceNumber+1,
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
                    willNumber: $scope.entity.willNumber,
                    will: {
                        title: "Testament "+$scope.entity.will.callNumber,
                        callNumber: $scope.entity.will.callNumber,
                        minuteLink: $scope.entity.will.minuteLink,
                        minuteDate: $scope.entity.will.minuteDate,
                        willWritingDate: $scope.entity.will.willWritingDate,
                        willWritingPlace: $scope.entity.will.willWritingPlace.id,
                        placePhysDescSupport: $scope.entity.will.placePhysDescSupport,
                        placePhysDescHeight: $scope.entity.will.placePhysDescHeight,
                        placePhysDescWidth: $scope.entity.will.placePhysDescWidth,
                        placePhysDescHand: $scope.entity.will.placePhysDescHand,
                        envelopPhysDescSupport: $scope.entity.will.envelopPhysDescSupport,
                        envelopPhysDescHeight: $scope.entity.will.envelopPhysDescHeight,
                        envelopPhysDescWidth: $scope.entity.will.envelopPhysDescWidth,
                        envelopPhysDescHand: $scope.entity.will.envelopPhysDescHand,
                        hostingOrganization: $scope.entity.will.hostingOrganization,
                        identificationUser: $scope.entity.will.identificationUser,
                    },
                    resources: []
                };

            for(let resource of $scope.entity.resources) {
                if(typeof resource.images === 'string') {
                    resource.images = resource.images.split(",");
                }
                let content = {
                    type: resource.type,
                    orderInWill: resource.orderInWill,
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
            $http.patch($rootScope.api+'/entities/'+$scope.entity.id, formEntity).
            then(function (response) {
                console.log(response.data);
                $scope.submit.loading = true;
                $state.go('transcript.app.entity', {id: response.data.id});
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
                    $state.go('transcript.admin.entity.list');
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