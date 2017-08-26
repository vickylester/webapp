'use strict';

angular.module('transcript.app.contact', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.contact', {
            views: {
                "page" : {
                    templateUrl: 'App/Contact/Contact.html',
                    controller: 'AppContactCtrl'
                }
            },
            url: '/contact',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Contact'
            },
        })
    }])

    .controller('AppContactCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'ContactService', 'flash', function($rootScope, $scope, $http, $sce, $state, ContactService, flash) {
        $scope.contact = {
            name: null,
            email: null,
            object: null,
            message: null
        };
        $scope.submit = {
            loading: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;

            contact();

            function contact() {
                return ContactService.send($scope.contact).
                then(function(data) {
                    $scope.submit.loading = false;
                    flash.success = $sce.trustAsHtml("<strong>Votre message a bien été envoyé.</strong>");
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
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
                });
            }
        };
    }])
;