'use strict';

angular.module('transcript.service.transcript', ['ui.router'])

    .service('TranscriptService', function($http, $rootScope) {
        return {
            getTranscripts: function() {
                return $http.get($rootScope.api+"/transcripts").then(function(response) {
                    return response.data;
                });
            },

            getTranscript: function(id) {
                return $http.get($rootScope.api+"/transcripts/"+id).then(function(response) {
                    return response.data;
                });
            },
            getTranscriptRights: function(user) {
                let role;
                console.log(user);

                if(user !== undefined && user !== null) {
                    if ($.inArray("ROLE_SUPER_ADMIN", user.roles) > -1 && $.inArray("ROLE_ADMIN", user.roles) > -1 && $.inArray("ROLE_MODO", user.roles) > -1) {
                        role = "validator";
                    } else {
                        role = "editor";
                    }
                } else {
                    role = "readOnly";
                }
                return role;
            },
            /**
             * This function encodes the TEI XML in HTML for live rendering.
             *
             * More information about the buttons, the tags and their rendering into toolbar.yml
             *
             * @param encodeLiveRender
             * @param button
             * @returns string
             */
            encodeHTML: function(encodeLiveRender, button) {
                let regex = "",
                    html = "";

                if(button.type === "tag") {
                    /* Tags:
                     * Tags are HTML tags such as <p>, <ul> or <section>
                     */
                    let attributesHtml = "";
                    if(button.html.attributes !== undefined) {
                        for(let attribute in button.html.attributes) {
                            attributesHtml += " "+attribute+"=\""+button.html.attributes[attribute]+"\"";
                        }
                    }

                    if (button.xml.unique === "false") {
                        regex = new RegExp("<" + button.xml.name + ">(.*)</" + button.xml.name + ">", "g");
                        html = "<"+button.html.name+attributesHtml+" >$1</"+button.html.name+">";
                    } else if (button.xml.unique === "true") {
                        regex = new RegExp("<" + button.xml.name + " />", "g");
                        html = "<"+button.html.name+" />";
                    }
                    encodeLiveRender = encodeLiveRender.replace(regex, html);
                } else if(button.type === "key") {
                    /* Keys:
                     * Keys are HTML tags without text inside such as <br />
                     */
                    regex = new RegExp("<" + button.xml.name + " />", "g");
                    html = "<"+button.html.name+" />";
                    encodeLiveRender = encodeLiveRender.replace(regex, html);
                } else if(button.type === "attribute") {
                    /* Attributes:
                     * Attributes are HTML attributes such as style, class, title, value.
                     * By default, they are applying to a <span> or a <div> tag.
                     */
                    if (button.xml.type === "inline") {
                        regex = new RegExp("<hi "+button.xml.name+"=\""+button.xml.value+"\">(.*)</hi>", "g");
                        html = "<span "+button.html.name+"=\""+button.html.value+"\" >$1</span>";
                    } else if (button.xml.type === "block") {
                        regex = new RegExp("<hi "+button.xml.name+"=\""+button.xml.value+"\">(.*)</hi>", "g");
                        html = "<div "+button.html.name+"=\""+button.html.value+"\" >$1</div>";
                    }
                    encodeLiveRender = encodeLiveRender.replace(regex, html);
                }

                return encodeLiveRender;
            },
            loadFile: function(file) {
                return 'App/Transcript/tpl/'+file+'.html';
            }
        };
    })

;