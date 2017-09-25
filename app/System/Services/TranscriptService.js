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
             * @param encodeLiveRender string
             * @param buttons array
             * @returns string
             */
            encodeHTML: function(encodeLiveRender, buttons) {
                let TS = this;
                let matchList = encodeLiveRender.match(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g);
                $.each(matchList, (function(index, value) {
                    let valueTagName = value.replace(/<([a-zA-Z]+).*>/g, '$1');
                    if(value[1] === "/") {
                        /* Match with end tag */
                        /* End tags need special regex*/
                        valueTagName = value.replace(/<\/([a-zA-Z]+).*>/g, '$1');
                        if(buttons[valueTagName] !== undefined) {
                            encodeLiveRender = encodeLiveRender.replace(value, TS.tagConstruction(buttons[valueTagName], "endTag"));
                        }
                    } else if(value[value.length-2] === "/") {
                        /* Match with single tag */
                        if(buttons[valueTagName] !== undefined) {
                            console.log(valueTagName);
                            encodeLiveRender = encodeLiveRender.replace(value, TS.tagConstruction(buttons[valueTagName], "singleTag"));
                        }
                    } else if(value[value.length-2] !== "/") {
                        /* Match with start tag, escaping single tags */
                        if(buttons[valueTagName] !== undefined) {
                            console.log(valueTagName);
                            encodeLiveRender = encodeLiveRender.replace(value, TS.tagConstruction(buttons[valueTagName], "startTag"));
                        }
                    }
                }));
                return encodeLiveRender;
            },
            tagConstruction: function(tag, type) {
                let attributesHtml = "";
                if(tag.html.attributes !== undefined) {
                    for(let attribute in tag.html.attributes) {
                        attributesHtml += " "+attribute+"=\""+tag.html.attributes[attribute]+"\"";
                    }
                }

                if(type === "endTag") {
                    return "</"+tag.html.name+">";
                } else if(type === "startTag") {
                    return "<"+tag.html.name+attributesHtml+">";
                } else if(type === "singleTag") {
                    return "<"+tag.html.name+attributesHtml+" />";
                }
            },
            loadFile: function(file) {
                return 'App/Transcript/tpl/'+file+'.html';
            },
            getParentTag: function(leftOfCursor, rightOfCursor, lines, tags) {
                let tag = "",
                    tagType = null,
                    startColS = null,
                    startRowS = null,
                    startColE = null,
                    startRowE = null,
                    startExtraCounter = 0,
                    startContent = null,
                    endColS = null,
                    endRowS = null,
                    endColE = null,
                    endRowE = null,
                    endContent = null,
                    tagContent = null,
                    tagAttributes = [],
                    parents = [],
                    parent = null,
                    content = leftOfCursor+rightOfCursor,
                    tagPos = null,
                    endPos = null,
                    parentLeftOfCursor = null,
                    parentRightOfCursor = null;

                /* This part computes the parent tag name : */
                function computeFromEndTag(startContent) {
                    console.log("computeFromEndTag");
                    tag = startContent.replace(/<\/([a-zA-Z]+)>/g, '$1');

                    if(tag !== "") {
                        tagType = "standard"; // -> This is an end tag, can't be a single tag

                        tagPos = leftOfCursor.lastIndexOf("<"+tag);
                        endPos = content.substring(tagPos, content.length).indexOf("</" + tag);

                        parentLeftOfCursor = leftOfCursor.substring(0, tagPos);
                        parentRightOfCursor = leftOfCursor.substring(tagPos, leftOfCursor.length)+rightOfCursor;
                    }
                }
                function computeFromStartTag(startContent) {
                    console.log("computeFromStartTag");
                    tag = startContent.replace(/<([a-zA-Z]+).*>/g, '$1');

                    if(tag !== "") {
                        if(startContent.substring(startContent.length-2, startContent.length) === "/>") {
                            tagType = "single";
                        } else { tagType = "standard"; }

                        tagPos = leftOfCursor.lastIndexOf("<");
                        if(tagType === "standard") {
                            endPos = rightOfCursor.indexOf("</" + tag);
                        }

                        parentLeftOfCursor = leftOfCursor.substring(0, tagPos);
                        parentRightOfCursor = leftOfCursor.substring(tagPos, leftOfCursor.length)+rightOfCursor;
                    }
                }

                if(leftOfCursor !== null && leftOfCursor.lastIndexOf("</") > leftOfCursor.lastIndexOf(">")) {
                    // The caret is inside an end tag > we use this tag as current tag
                    //console.log("inside endtag");
                    //console.log(leftOfCursor.substring(leftOfCursor.lastIndexOf("</"), leftOfCursor.length)+rightOfCursor.substring(0, rightOfCursor.indexOf(">")+1));
                    startContent = leftOfCursor.substring(leftOfCursor.lastIndexOf("</"), leftOfCursor.length)+rightOfCursor.substring(0, rightOfCursor.indexOf(">")+1);
                    computeFromEndTag(startContent);
                } else if(leftOfCursor !== null && leftOfCursor.lastIndexOf("<") > leftOfCursor.lastIndexOf(">")) {
                    // The caret is inside a tag > we use this tag as current tag
                    //console.log("inside tag");
                    //console.log(leftOfCursor.substring(leftOfCursor.lastIndexOf("<"), leftOfCursor.length)+rightOfCursor.substring(0, rightOfCursor.indexOf(">")+1));

                    startContent = leftOfCursor.substring(leftOfCursor.lastIndexOf("<"), leftOfCursor.length)+rightOfCursor.substring(0, rightOfCursor.indexOf(">")+1);
                    if(startContent[1] === "/") { computeFromEndTag(startContent); }
                    else { computeFromStartTag(startContent); }

                } else if (leftOfCursor !== null && leftOfCursor.indexOf("<") !== -1) {
                    // The caret is outside a tag > we use the nearest tag as current tag
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

                    if(tag !== "") {
                        tagType = "standard";
                        tagPos = leftOfCursor.lastIndexOf("<" + tag);
                        endPos = rightOfCursor.indexOf("</" + tag);

                        parentLeftOfCursor = leftOfCursor.substring(0, leftOfCursor.lastIndexOf(tag)-1);
                        parentRightOfCursor = leftOfCursor.substring(leftOfCursor.lastIndexOf(tag)-1, leftOfCursor.length)+rightOfCursor;
                    }
                }

                if(tag !== "") {
                    /*
                     * This part computes the start tag's position
                     */
                    if(tagType === "standard") {
                        startExtraCounter = 1;
                    } else if(tagType === "single") {
                        startExtraCounter = 2;
                    }
                    let tagPosStart = tagPos;
                    for(let kLine in lines) {
                        let line = lines[kLine];
                        if(line.length <= tagPosStart) {
                            tagPosStart -= line.length;
                        } else {
                            let afterTagPos = line.substring(tagPosStart+tag.length, line.length);
                            let endTagFull = afterTagPos.indexOf('>');
                            startRowS = parseInt(kLine);
                            startColS = parseInt(tagPosStart);
                            startRowE = parseInt(kLine);
                            startColE = parseInt(tagPosStart+tag.length+endTagFull+startExtraCounter);
                            startContent = line.substring(tagPosStart, tagPosStart+tag.length+endTagFull+startExtraCounter);
                            break;
                        }
                    }

                    /*
                     * This part returns end tag's information
                     */
                    if(tagType === "standard") {
                        let endPosStart = endPos;
                        endPosStart += leftOfCursor.length;
                        for(let kLine in lines) {
                            let line = lines[kLine];
                            if(line.length <= endPosStart) {
                                endPosStart -= line.length;
                            } else {
                                endRowS = parseInt(kLine);
                                endColS = parseInt(endPosStart);
                                endRowE = parseInt(kLine);
                                endColE = parseInt(endPosStart+tag.length+3);
                                endContent = line.substring(endPosStart, endPosStart+tag.length+3);
                                break;
                            }
                        }
                    }

                    /*
                     * This part returns the content of the tag
                     */
                    if(tagType === "standard") {
                        let afterTagPosContent = content.substring(tagPos + tag.length, content.length);
                        let tagPosFullContent = afterTagPosContent.indexOf('>');
                        tagContent = content.substring(tagPos + tag.length + tagPosFullContent + 1, (leftOfCursor.length - (tagPos + tag.length + tagPosFullContent)) + tagPos + tag.length + tagPosFullContent + endPos);
                    }
                    /*
                     * This part computes the tag's attributes
                     */
                    let attributesList = startContent.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);
                    //console.log(attributesList);
                    for(let kAttribute in attributesList) {
                        let attributeFull = attributesList[kAttribute];
                        let attribute = attributeFull.replace(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g, '$1');
                        let value = attributeFull.replace(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g, '$2');
                        tagAttributes.push({attribute: attribute, value: value});
                        //console.log(attribute);
                        //console.log(value);
                    }

                    /*
                     * This part compiles parents of the tag
                     */
                    // If tag can have parents, we compute the parents
                    if(tags[tag] !== undefined && tags[tag].btn.allow_root === false) {
                        parent = this.getParentTag(parentLeftOfCursor, parentRightOfCursor, lines, tags);
                        parents = this.getParents(parent, []);
                        parents.push(parent);
                    } else if(tags[tag] !== undefined && tags[tag].btn.allow_root === true){
                        parent = null;
                        parents = [];
                    }

                    /*
                     * Creation of the returned object
                     */
                    let varReturn = {
                        name: tag,
                        type: tagType,
                        attributes: tagAttributes,
                        startTag: {
                            start: {
                                row: startRowS,
                                column: startColS
                            },
                            end: {
                                row: startRowE,
                                column: startColE
                            },
                            content: startContent
                        },
                        endTag: {
                            start: {
                                row: endRowS,
                                column: endColS
                            },
                            end: {
                                row: endRowE,
                                column: endColE
                            },
                            content: endContent
                        },
                        content: tagContent,
                        parent: parent,
                        parents: parents
                    };
                    console.log(varReturn);
                    return varReturn;
                } else {
                    return {
                        name: null,
                        type: null,
                        attributes: null,
                        startTag: {
                            start: {
                                row: null,
                                column: null
                            },
                            end: {
                                row: null,
                                column: null
                            },
                            content: null
                        },
                        endTag: {
                            start: {
                                row: null,
                                column: null
                            },
                            end: {
                                row: null,
                                column: null
                            },
                            content: null
                        },
                        content: null,
                        parent: null,
                        parents: null
                    };
                }
            },
            getParents(tagStructure, parents) {
                if(tagStructure.parent !== null) {
                    if(tagStructure.parent.parent !== null) {parents = this.getParents(tagStructure.parent, parents);}
                    parents.push(tagStructure.parent);
                }
                return parents;
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