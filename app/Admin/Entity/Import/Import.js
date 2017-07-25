'use strict';

angular.module('transcript.admin.entity.import', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin.entity.import', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Entity/Import/Import.html',
                    controller: 'AdminEntityImportCtrl'
                }
            },
            url: '/import',
            resolve: {
                testators: function(EntityService) {
                    return EntityService.getTestators();
                }
            }
        })
    }])

    .controller('AdminEntityImportCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'testators', 'EntityService', function($rootScope, $scope, $http, $sce, $state, testators, EntityService) {
        $scope.form = {
            submit: {
                loading: false
            }
        };
        $scope.entity = {
            resources: [],
            will: {}
        };
        $scope.testators = testators;


        $scope.form.addResource = function(resourceNumber) {
            $scope.entity.resources.push({
                type: '',
                orderInWill: resourceNumber+1,
                images: '',
                notes: '',
                transcript: {
                    status: 'todo',
                    updateComment: 'Creation of the transcript'
                }
            });
        };

        $scope.form.submit.action = function() {
            console.log($scope.entity);
            $scope.form.submit.loading = true;

            if(typeof($scope.entity.will.testator) === "number") {
                postEntity();
            } else if(typeof($scope.entity.will.testator) === "object") {
                postTestator();
            }

            function postTestator() {
                return EntityService.postTestator($scope.entity.will.testator).then(function(data) {
                    $scope.entity.will.testator = data.id;
                    postEntity();
                });
            }

            function postEntity() {
                for(let resource of $scope.entity.resources) {
                    resource.images = resource.images.split(",");
                }

                $scope.entity.will.title = "Testament "+$scope.entity.will.callNumber;
                $scope.entity.will.minuteDate = new Date($scope.entity.will.minuteDate);
                $scope.entity.will.willWritingDate = new Date($scope.entity.will.willWritingDate);

                return EntityService.postEntity($scope.entity).then(function(data) {
                    $scope.form.submit.loading = false;
                    $state.go('app.entity', {id: data.id});
                });
            }


            /*$http.post($rootScope.api+'/entities', $scope.entity,
                {
                    headers:  {
                        'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token
                }
            }).then(function (response) {
                console.log(response.data);
                $scope.form.submit.loading = false;
            }, function errorCallback(response) {
                $scope.form.submit.loading = false;
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
                console.log(response);
            });*/
        }

    }])
;