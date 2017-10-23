'use strict';

angular.module('transcript.service.training-content', ['ui.router'])

    .service('TrainingContentService', function($http, $rootScope, $sce) {
        return {
            getTrainingContents: function(type, status, orderInTraining) {
                let typeContainer = "",
                    statusContainer = "",
                    orderInTrainingContainer = "",
                    arrayContainer = [];

                if(type !== null) {typeContainer = "type="+type; arrayContainer.push(typeContainer);}
                if(status !== null) {statusContainer = "status="+status; arrayContainer.push(statusContainer);}
                if(orderInTraining !== null) {orderInTrainingContainer = "orderInTraining="+orderInTraining; arrayContainer.push(orderInTrainingContainer);}
                let query = arrayContainer.join("&");

                return $http.get(
                    $rootScope.api+"/training-contents?"+query
                ).then(function(response) {
                    for(let id in response.data) {
                        if(response.data[id].content !== null) {
                            response.data[id].content = $sce.trustAsHtml(response.data[id].content);
                        }
                    }
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getTrainingContent: function(id, encode) {
                return $http.get(
                    $rootScope.api+"/training-contents/"+id
                ).then(function(response) {
                    if(encode === true && response.data.content !== null) {response.data.content = $sce.trustAsHtml(response.data.content);}
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getTrainingContentByOrder: function(order, encode) {
                return $http.get(
                    $rootScope.api+"/training-contents?order="+order
                ).then(function(response) {
                    if(response.data.length > 0) {
                        let content = response.data[0];
                        if(encode === true && content.content !== null) {content.content = $sce.trustAsHtml(content.content);}
                        return content;
                    } else {
                        return null;
                    }
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            }
        };
    })

;