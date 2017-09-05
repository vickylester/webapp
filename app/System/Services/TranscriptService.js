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

                return encodeLiveRender;
            },
            loadFile: function(file) {
                return 'App/Transcript/tpl/'+file+'.html';
            },
            getParentTag: function(leftOfCursor, rightOfCursor, lines) {
                let tag = "",
                    posColS = null,
                    posRowS = null,
                    posColE = null,
                    posRowE = null,
                    endColS = null,
                    endRowS = null,
                    endColE = null,
                    endRowE = null,
                    tagContent = null;

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

                /*
                 * This part returns end tag's information
                 */
                if(tag !== "") {
                    let endPos = rightOfCursor.indexOf(tag);
                    //console.log(endPos);
                    endPos += leftOfCursor.length;
                    for(let kLine in lines) {
                        let line = lines[kLine];
                        if(line.length < endPos) {
                            endPos -= line.length;
                        } else {
                            endRowS = parseInt(kLine);
                            endColS = parseInt(endPos);
                            endRowE = parseInt(kLine);
                            endColE = parseInt(endPos+tag.length);
                            break;
                        }
                    }
                }

                /*
                 * This part returns the content of the tag
                 */
                if(tag !== "") {
                    let tagPos = leftOfCursor.lastIndexOf(tag);
                    let endPos = rightOfCursor.indexOf(tag);
                    let content = leftOfCursor+rightOfCursor;

                     tagContent = content.substring(tagPos+(tag.length), (leftOfCursor.length)+endPos);
                    if(tagContent.substring(0, 1) === '>') {
                        tagContent = tagContent.substring(1, tagContent.length);
                    }
                    if(tagContent.substring(tagContent.length-2, tagContent.length) === '</') {
                        tagContent = tagContent.substring(0, tagContent.length-2);
                    }
                }

                /*
                 * This part compiles results
                 */
                if(tag !== "") {
                    let varReturn = {
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
                        end: {
                            start: {
                                row: endRowS,
                                column: endColS
                            },
                            end: {
                                row: endRowE,
                                column: endColE
                            }
                        },
                        content: tagContent,
                        parent: null
                    };
                    console.log(varReturn);
                    return varReturn;
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
                        end: {
                            start: {
                                row: null,
                                column: null
                            },
                            end: {
                                row: null,
                                column: null
                            }
                        },
                        content: null,
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