'use strict';

angular.module('transcript.admin.training.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.training.view', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Training/View/View.html',
                        controller: 'AdminTrainingViewCtrl'
                    }
                },
                url: '/view/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.training.list',
                    label: '{{ trainingContent.title }}'
                },
                tfMetaTags: {
                    title: '{{ trainingContent.title }}',
                },
                resolve: {
                    trainingContent: function(TrainingContentService, $transition$) {
                        return TrainingContentService.getTrainingContent($transition$.params().id, true);
                    }
                }
            })
    }])

    .controller('AdminTrainingViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'trainingContent', function($rootScope, $scope, $http, $sce, $state, trainingContent) {
        $scope.trainingContent = trainingContent;
    }])
;