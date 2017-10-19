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
                    form
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
                    if ($.inArray("ROLE_SUPER_ADMIN", user.roles) !== -1 || $.inArray("ROLE_ADMIN", user.roles) !== -1 || $.inArray("ROLE_MODO", user.roles) !== -1) {
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
                            // console.log(valueTagName);
                            encodeLiveRender = encodeLiveRender.replace(value, TS.tagConstruction(buttons[valueTagName], "singleTag"));
                        }
                    } else if(value[value.length-2] !== "/") {
                        /* Match with start tag, escaping single tags */
                        if(buttons[valueTagName] !== undefined) {
                            // console.log(valueTagName);
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
                function getTagPos(tpContent, tpTag, order) {
                    let tagPosA = null, tagPosB = null, tagPosC = null;
                    if(order === "ASC") {
                        tagPosA = tpContent.indexOf("<"+tpTag+" ");
                        tagPosB = tpContent.indexOf("<"+tpTag+"/>");
                        tagPosC = tpContent.indexOf("<"+tpTag+">");
                    } else if(order === "DESC") {
                        tagPosA = tpContent.lastIndexOf("<"+tpTag+" ");
                        tagPosB = tpContent.lastIndexOf("<"+tpTag+"/>");
                        tagPosC = tpContent.lastIndexOf("<"+tpTag+">");
                    }

                    let tagPosArray = [tagPosA, tagPosB, tagPosC];
                    tagPosArray.sort();
                    tagPosArray.reverse();
                    return tagPosArray[0];
                }
                /* GLOBAL INFORMATION:
                 * - Positions shouldn't depend on the caret position. It should be absolute values, not relative.
                 * - endPos should be an absolute value, not relative to tagPos
                 */

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
                    children = [],
                    content = leftOfCursor+rightOfCursor,
                    tagPos = null,
                    endPos = null,
                    parentLeftOfCursor = null,
                    parentRightOfCursor = null;

                function registerChild(content, type) {
                    children.push({content: content, type: type});
                }

                /* -------------------------------------------------------------------------------------------------- */
                /* -- Functions used to compute start and end position of tags -- */
                /* -------------------------------------------------------------------------------------------------- */
                function computeEndOfTag(tag, tagPos, leftOfCursor, rightOfCursor, carriedCounter) {
                    let iEndPos = tagPos+content.substring(tagPos, content.length).indexOf("</" + tag),
                        iPortion = content.substring(tagPos+1+tag.length, iEndPos);

                    if(iPortion.indexOf("<"+tag) !== -1) {
                        // Meaning there is another similar tag as child
                        let list = iPortion.match(new RegExp("<"+tag,'g'));
                        return computeEndOfTag(tag, iEndPos, leftOfCursor, rightOfCursor, carriedCounter+list.length-1);
                    } else if(carriedCounter > 0) {
                        // If the carried list is not empty
                        return computeEndOfTag(tag, iEndPos, leftOfCursor, rightOfCursor, carriedCounter-1);
                    } else {
                        if(carriedCounter > 0 && iEndPos !== null) {
                            // If we are computing the value for a parent:
                            let previous = 0;
                            for(let i = 0; i <= carriedCounter; i++) {
                                previous = rightOfCursor.indexOf("</" + tag);
                                rightOfCursor = rightOfCursor.substring(previous+2+tag.length+1, rightOfCursor.length);
                                iEndPos += rightOfCursor.indexOf("</" + tag)+2+tag.length+1;
                            }
                            iEndPos += leftCredit+1-(2+tag.length+1);
                        }
                        // Else, we return the tag pos
                        return iEndPos;
                    }
                }
                function computeStartOfTag(tag, endPos, leftOfCursor, rightOfCursor, carriedCounter) {
                    let iContent = leftOfCursor+rightOfCursor;
                    console.log(endPos);
                    console.log(content.substring(0, endPos));

                    // We are looking for the last position of tag pos
                    let iTagPos = getTagPos(content.substring(0, endPos), tag, "DESC");
                    console.log(iTagPos);

                    let iPortion = iContent.substring(iTagPos, endPos);
                    console.log(iPortion);

                    if(iPortion.indexOf("</"+tag+">") !== -1) {
                        // Meaning there is another similar tag as child
                        let list = iPortion.match(new RegExp("</"+tag+">",'g'));
                        return computeStartOfTag(tag, iTagPos, leftOfCursor, rightOfCursor, carriedCounter+list.length-1);
                    } else if(carriedCounter > 0) {
                        // If the carried list is not empty
                        return computeStartOfTag(tag, iTagPos, leftOfCursor, rightOfCursor, carriedCounter-1);
                    } else {
                        // Else, we return the tag pos
                        return iTagPos;
                    }
                }
                function computeFromEndTag(startContent) {
                    tag = startContent.replace(/<\/([a-zA-Z]+)>/g, '$1');

                    if(tag !== "") {
                        tagType = "standard"; // -> This is an end tag, can't be a single tag
                        endPos = leftOfCursor.lastIndexOf("<");
                        tagPos = computeStartOfTag(tag, endPos, leftOfCursor, rightOfCursor, 0);

                        parentLeftOfCursor = leftOfCursor.substring(0, tagPos);
                        parentRightOfCursor = leftOfCursor.substring(tagPos, leftOfCursor.length)+rightOfCursor;
                    }
                }
                function computeFromStartTag(startContent) {
                    tag = startContent.replace(/<([a-zA-Z]+).*>/g, '$1');

                    if(tag !== "") {
                        if(startContent.substring(startContent.length-2, startContent.length) === "/>") {
                            tagType = "single";
                        } else { tagType = "standard"; }

                        tagPos = getTagPos(leftOfCursor, tag, "DESC");
                        if(tagType === "standard") {
                            endPos = computeEndOfTag(tag, tagPos, leftOfCursor, rightOfCursor, 0);
                        }

                        parentLeftOfCursor = leftOfCursor.substring(0, tagPos);
                        parentRightOfCursor = leftOfCursor.substring(tagPos, leftOfCursor.length)+rightOfCursor;
                    }
                }
                /* -------------------------------------------------------------------------------------------------- */

                /* -------------------------------------------------------------------------------------------------- */
                /* -- This part computes the parent tag name: -- */
                /* -------------------------------------------------------------------------------------------------- */
                if(leftOfCursor !== null && leftOfCursor.lastIndexOf("</") > leftOfCursor.lastIndexOf(">")) {
                    // The caret is inside an end tag > we use this tag as current tag
                    startContent = leftOfCursor.substring(leftOfCursor.lastIndexOf("</"), leftOfCursor.length)+rightOfCursor.substring(0, rightOfCursor.indexOf(">")+1);
                    computeFromEndTag(startContent);
                } else if(leftOfCursor !== null && leftOfCursor.lastIndexOf("<") > leftOfCursor.lastIndexOf(">")) {
                    // The caret is inside a tag > we use this tag as current tag
                    startContent = leftOfCursor.substring(leftOfCursor.lastIndexOf("<"), leftOfCursor.length)+rightOfCursor.substring(0, rightOfCursor.indexOf(">")+1);
                    if(startContent[1] === "/") { computeFromEndTag(startContent); }
                    else { computeFromStartTag(startContent); }

                } else if (leftOfCursor !== null && leftOfCursor.indexOf("<") !== -1) {
                    // The caret is outside a tag -> we use the nearest tag as current tag
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
                        let tagPos = getTagPos(leftOfCursor, tag, "DESC");

                        let startContentFull = content.substring(tagPos, content.length);
                        startContent = startContentFull.substring(0, startContentFull.indexOf(">")+1);
                        computeFromStartTag(startContent);

                        parentLeftOfCursor = leftOfCursor.substring(0, leftOfCursor.lastIndexOf(tag)-1);
                        parentRightOfCursor = leftOfCursor.substring(leftOfCursor.lastIndexOf(tag)-1, leftOfCursor.length)+rightOfCursor;
                    }
                }
                /* -------------------------------------------------------------------------------------------------- */

                /* -------------------------------------------------------------------------------------------------- */
                /* -- If a tag has been identified, we compute the relative information -- */
                /* -------------------------------------------------------------------------------------------------- */
                if(tag !== "") {
                    /* -------------------------------------------------------------------------------------------------
                     * This part computes the start tag's position
                     ------------------------------------------------------------------------------------------------ */
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
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part returns end tag's information
                     ------------------------------------------------------------------------------------------------ */
                    if(tagType === "standard") {
                        let endPosStart = endPos;
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
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part returns the content of the tag
                     ------------------------------------------------------------------------------------------------ */
                    if(tagType === "standard") {
                        let afterTagPosContent = content.substring(tagPos + 1 + tag.length, content.length);
                        let tagPosFullContent = afterTagPosContent.indexOf('>');
                        tagContent = content.substring(tagPos + 1 + tag.length + tagPosFullContent + 1, endPos);
                    }
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part computes the tag's attributes
                     ------------------------------------------------------------------------------------------------ */
                    let attributesList = startContent.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);
                    for(let kAttribute in attributesList) {
                        let attributeFull = attributesList[kAttribute];
                        let attribute = attributeFull.replace(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g, '$1');
                        let value = attributeFull.replace(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g, '$2');
                        tagAttributes.push({attribute: attribute, value: value});
                    }
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part compiles the parents of the tag
                     ------------------------------------------------------------------------------------------------ */
                    // If tag can have parents, we compute the parents
                    if(tags[tag] !== undefined && tags[tag].btn.restrict_to_root === false) {
                        parent = this.getParentTag(parentLeftOfCursor, parentRightOfCursor, lines, tags);
                        parents = this.getParents(parent, []);
                        parents.push(parent);

                        if(tags[tag].btn.allow_root === true && parent.name === null) {
                            parent = null;
                            parents = [];
                        }
                    } else if(tags[tag] !== undefined && tags[tag].btn.restrict_to_root === true){
                        parent = null;
                        parents = [];
                    }
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part compiles the children of the tag
                     ------------------------------------------------------------------------------------------------ */
                    if(tagContent !== null) {
                        if(tagContent.indexOf("<") !== -1) {
                            // First step: we create a list of the tags and the string in the tagContent

                            // There is at least one tag in the tag content
                            let currentContent = "";
                            let currentContentType = null;
                            /* Methodology:
                             * We loop each character and when we detect changes (by < and > characters), we register the entry
                             */
                            for(let key in tagContent) {
                                key = parseInt(key);
                                let character           = tagContent[key]; //console.log(character);
                                let nextCharacter       = tagContent[key+1];
                                let previousCharacter   = tagContent[key-1];

                                if(character === "<" && nextCharacter !== " ") {
                                    // This is the start of a tag

                                    if(currentContent !== "") {
                                        // We register the previous children
                                        registerChild(currentContent, "string");
                                    }

                                    currentContent = character;
                                    currentContentType = "tag";
                                } else if(character === ">" && currentContentType === "tag") {
                                    // This is the end of a tag
                                    currentContent += character;
                                    registerChild(currentContent, "tag");

                                    // Reset values:
                                    currentContent = "";
                                    currentContentType = null;
                                } else if(currentContentType === null) {
                                    // Case where we start a new string
                                    currentContentType = "string";
                                    currentContent += character;
                                } else if(nextCharacter === undefined && character !== ">" && currentContent !== "") {
                                    // This is the last character and this is not the end of a tag
                                    registerChild(currentContent, "string");
                                } else {
                                    currentContent += character;
                                }

                            }

                            // Second step: we recompute the tag values and string values:
                            for(let iChild in children) {
                                iChild = parseInt(iChild);
                                let child           = children[iChild]; //console.log(character);
                                let nextChild       = children[iChild+1];
                                let previousChild   = children[iChild-1];

                                if(child.type === "tag" && child.content[(child.content.length-2)] === "/" && child.content[(child.content.length-1)] === ">") {
                                    // This is an single tag
                                    child.subType = "singleTag";
                                    child.tag = child.content.replace(/<([a-zA-Z]+).*>/g, '$1');
                                } else if(child.type === "tag" && child.content[1] === "/") {
                                    // This is an end tag
                                    child.subType = "endTag";
                                    child.tag = child.content.replace(/<\/([a-zA-Z]+).*>/g, '$1');
                                } else if(child.type === "tag" && child.content[1] !== "/") {
                                    // This is a start tag
                                    child.subType = "startTag";
                                    child.tag = child.content.replace(/<([a-zA-Z]+).*>/g, '$1');
                                }
                            }

                            // Third step: we merge the tag and the string:
                            let newChildren3 = [];
                            let skipList3 = [];
                            for(let iChild in children) {
                                iChild = parseInt(iChild);
                                let child           = children[iChild]; //console.log(character);
                                let nextChild       = children[iChild+1];
                                let previousChild   = children[iChild-1];

                                if(skipList3.indexOf(iChild) !== -1) {
                                    continue;
                                } else if(child.type === "string" &&
                                previousChild !== undefined && previousChild.type === "tag" && previousChild.subType === "startTag" &&
                                nextChild !== undefined && nextChild.type === "tag" && nextChild.subType === "endTag" &&
                                previousChild.tag === nextChild.tag) {
                                    newChildren3.splice(newChildren3.length-1, 1);
                                    skipList3.push(iChild+1);
                                    newChildren3.push({
                                        content: previousChild.content+child.content+nextChild.content,
                                        type: "tag"
                                    });
                                } else {
                                    newChildren3.push(child);
                                }
                            }
                            children = newChildren3;

                            // Fourth step: we merge the tags:
                            let newChildren4 = [];
                            let mergeContent4 = "";
                            let mergeContentTag4 = "";
                            for(let iChild in children) {
                                iChild = parseInt(iChild);
                                let child           = children[iChild]; //console.log(character);

                                if(child.subType === "startTag") {
                                    mergeContent4 = child.content;
                                    mergeContentTag4 = child.tag;
                                } else if((child.type === "tag" && child.subType === undefined) || child.subType !== "endTag" || (child.subType === "endTag" && child.tag !== mergeContentTag4) && mergeContent4 !== "") {
                                    mergeContent4 += child.content;
                                } else if(child.type === "tag" && child.subType === "endTag" && child.tag === mergeContentTag4 && mergeContent4 !== "") {
                                    mergeContent4 += child.content;
                                    newChildren4.push({
                                        content: mergeContent4,
                                        type: "tag"
                                    });
                                    mergeContent4 = "";
                                    mergeContentTag4 = "";
                                } else if(child.type !== "tag") {
                                    newChildren4.push(child);
                                }
                            }
                            children = newChildren4;
                        } else {
                            // Tag content is string
                            registerChild(tagContent, "string");
                        }
                    }
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * Creation of the returned object
                     ------------------------------------------------------------------------------------------------ */
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
                        parents: parents,
                        children: children
                    };
                    console.log(varReturn);
                    return varReturn;
                    /* ---------------------------------------------------------------------------------------------- */
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
                        parents: null,
                        children: null
                    };
                }
                /* -------------------------------------------------------------------------------------------------- */
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