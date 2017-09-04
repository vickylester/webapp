'use strict';

angular.module('transcript.service.transcript', ['ui.router'])

    .service('TranscriptService', function($http, $rootScope) {
        return {
            getTranscripts: function() {
                return $http.get(
                    $rootScope.api+"/transcripts"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getTranscript: function(id) {
                return $http.get(
                    $rootScope.api+"/transcripts/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            patchTranscript: function(form, id) {
                return $http.patch(
                    $rootScope.api+"/transcripts/"+id,
                    form,
                    { headers:  { 'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
                ).then(function(response) {
                    console.log(response);
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
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
            },
            getParentTag: function(leftOfCursor, lines) {
                let tag = "";
                let posColS = null;
                let posRowS = null;
                let posColE = null;
                let posRowE = null;

                /* This part computes the parent tag name : */
                if (leftOfCursor !== null && leftOfCursor.indexOf("<") !== -1) {
                    /*
                     * <\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g
                     * Regex from http://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
                     */
                    let matchList = leftOfCursor.match(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g);

                    if(matchList !== null && matchList.length > 0) {
                        matchList = matchList.reverse();

                        /* We list each tag in the text before the cursor,
                         * beginning by the closer of the cursor.
                         * Aim is to find the first unclosed tag
                         */
                        let carriedList = [];
                        $.each(matchList, (function(index, value) {
                            if(value[1] === "/") {
                                /* Match with end tag */
                                // We place the tagName in the "carriedList" if it's the end
                                carriedList.push(value.substring(2,(value.length-1)).replace(/\s/g,''));
                            } else if(value[value.length-2] !== "/") {
                                /* Match with start tag, escaping alone tags */
                                // Starting by extracting the tag name from the tag
                                let valueTagName = value.replace(/<([a-zA-Z]+).*>/g, '$1');
                                if(carriedList.indexOf(valueTagName) !== -1) {
                                    // If the tag name is in the carried list, the tag has been closed, we slice it
                                    carriedList.slice(carriedList.indexOf(valueTagName), 1);
                                } else {
                                    // Else, it is not closed : this is it
                                    tag = valueTagName;
                                    return false;
                                }
                            }
                        }));
                    }
                }

                /*
                 * This part computes the parent tag position
                 * The position is the position of the tag name, not the full tag.
                 * Eg, for <tag attr="val">, it will return the position of "tag"
                 */
                if(tag !== "") {
                    let tagPos = leftOfCursor.lastIndexOf(tag);
                    for(let kLine in lines) {
                        let line = lines[kLine];
                        if(line.length < tagPos) {
                            tagPos -= line.length;
                        } else {
                            posRowS = parseInt(kLine);
                            posColS = parseInt(tagPos);
                            posRowE = parseInt(kLine);
                            posColE = parseInt(tagPos+tag.length);
                            break;
                        }
                    }
                }

                if(tag !== "") {
                    return {
                        name: tag,
                        position: {
                            start: {
                                row: posRowS,
                                column: posColS
                            },
                            end: {
                                row: posRowE,
                                column: posColE
                            }
                        },
                        parent: null
                    };
                } else {
                    return {
                        name: null,
                        position: {
                            start: {
                                row: null,
                                column: null
                            },
                            end: {
                                row: null,
                                column: null
                            }
                        },
                        parent: null
                    };
                }
            },
            getTeiInfo: function() {
                return $http.get(
                    $rootScope.api+"/model?elements=true&info=full"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            }
        };
    })

;