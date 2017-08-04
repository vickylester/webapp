'use strict';

angular.module('transcript.app.thesaurus', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.thesaurus', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>'
                }
            },
            url: '/thesaurus'
        })
    }])

    .service('ThesaurusService', function($http, $rootScope) {
        return {
            getThesaurusEntities: function(type) {
                return $http.get($rootScope.api+"/"+type).then(function(response) {
                    return response.data;
                });
            },

            getThesaurusEntity: function(type, id) {
                return $http.get($rootScope.api+"/"+type+"/"+id).then(function(response) {
                    return response.data;
                });
            },

            postThesaurusEntity: function(type, data) {
                return $http.post($rootScope.api+"/"+type, data,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                });
            },

            patchThesaurusEntity: function(type, id, data) {
                return $http.patch($rootScope.api+"/"+type+"/"+id, data,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                });
            },

            removeThesaurusEntity: function(type, id) {
                return $http.delete($rootScope.api+"/"+type+"/"+id,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                });
            },

            getFormType: function(entity, type) {
                let form;
                switch(type) {
                    case 'testators':
                        form = {
                            name: entity.name,
                            surname: entity.surname,
                            firstnames: entity.firstnames,
                            profession: entity.profession,
                            address: entity.address,
                            dateOfBirth: new Date(entity.date_of_birth),
                            placeOfBirth: entity.place_of_birth.id,
                            dateOfDeath: new Date(entity.date_of_death),
                            placeOfDeath: entity.place_of_death.id,
                            deathMention: entity.death_mention,
                            memoireDesHommes: entity.memoire_des_hommes,
                            regiment: entity.regiment.id,
                            rank: entity.rank,
                            description: entity.description,
                            updateComment: entity.update_comment
                        };
                        break;
                    case 'regiments':
                        form = {
                            name: entity.name,
                            description: entity.description,
                            updateComment: entity.update_comment
                        };
                        break;
                    case 'places':
                        form = {
                            name: entity.name,
                            description: entity.description,
                            updateComment: entity.update_comment
                        };
                        break;
                    default:
                        form = {
                            name: entity.name,
                            description: entity.description
                        };
                }
                return form;
            }
        };
    })
;