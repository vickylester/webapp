'use strict';

angular.module('transcript.app.transcript', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.transcript', {
            views: {
                "page" : {
                    templateUrl: 'App/Transcript/Transcript.html',
                    controller: 'AppTranscriptCtrl'
                },
                "comment@app.transcript" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            ncyBreadcrumb: {
                parent: 'app.edition({idEntity: entity.id, idResource: resource.id})',
                label: 'Transcription'
            },
            url: '/transcript/:idEntity/:idResource/:idTranscript',
            resolve: {
                transcript: function(TranscriptService, $transition$) {
                    return TranscriptService.getTranscript($transition$.params().idTranscript);
                },
                resource: function(ResourceService, $transition$) {
                    return ResourceService.getResource($transition$.params().idResource);
                },
                entity: function(EntityService, $transition$) {
                    return EntityService.getEntity($transition$.params().idEntity);
                },
                thread: function(CommentService, $transition$) {
                    return CommentService.getThread('transcript-'+$transition$.params().id);
                },
                teiInfo: function(TranscriptService) {
                    return TranscriptService.getTeiInfo();
                },
                config: function() {
                    return YAML.load('App/Transcript/toolbar.yml');
                },
                testators: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities("testators");
                },
                places: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities("places");
                },
                regiments: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities("regiments");
                }
            }
        })
    }])

    .controller('AppTranscriptCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$timeout', 'TranscriptService', 'ContentService', 'SearchService', 'entity', 'resource', 'transcript', 'teiInfo', 'config', 'testators', 'places', 'regiments', function($rootScope, $scope, $http, $sce, $state, $timeout, TranscriptService, ContentService, SearchService, entity, resource, transcript, teiInfo, config, testators, places, regiments) {
        if($rootScope.user === undefined) {$state.go('login');}
        /* -------------------------------------------------------------------------------- */
        /* $scope & variables */
        /* -------------------------------------------------------------------------------- */
        $scope.transcript = transcript;
        $scope.resource = resource;
        $scope.entity = entity;
        $scope.teiInfo = teiInfo.data;
        $scope.config = config;
        $scope.taxonomy = {
            testators: testators,
            places: places,
            regiments: regiments
        };

        $scope.page = {
            fullscreen: {
                status: false
            }
        };
        $scope.transcriptArea = {
            interaction: {
                status: "live",
                live: {
                    content: ""
                },
                content: {
                    title: "",
                    text: "",
                    history: []
                },
                doc: {
                    title: null,
                    element: null,
                    structure: null
                },
                taxonomy: {
                    result: null,
                    dataType: null,
                    entities: null,
                    string: null,
                    taxonomySelected: null
                },
                version: {
                    id: null,
                    content: null
                }
            },
            ace: {
                currentTag: {
                    name: null,
                    position: {
                        row: null,
                        column: null
                    },
                    parent: null
                },
                area: $scope.transcript.content,
                modal: {
                    content: "",
                    variables: {}
                }
            },
            toolbar: {
                tags: $scope.config.tags,
                buttonsGroups: $scope.config.buttonsGroups,
                attributes: []
            }
        };
        $scope.submit = {
            loading: false,
            success: false,
            form: {},
            checkList: {
                /**
                 * a1 = ok
                 * a2 = non ok
                 * a3 = don't know
                 * a4 = no info
                 */
                isTranscribed: "a4"
            },
            state: {
                icon: "fa-thumbs-o-up",
                bg: "bg-success",
                btn: "btn-success"
            }
        };
        $scope.admin = {
            validation: {
                accept: {
                    loading: false
                },
                refuse: {
                    loading: false
                }
            },
            status: {
                loading: false,
                value: transcript.status
            }
        };
        $scope.role = TranscriptService.getTranscriptRights($rootScope.user);

        if(transcript.content === null) {$scope.transcriptArea.ace.area = "";}
        /* $scope & variables ------------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Functions */
        /* -------------------------------------------------------------------------------- */
        /**
         * Encode the transcription in HTML
         *
         * @param encodeLiveRender
         * @param button
         * @returns {*}
         */
        function encodeHTML(encodeLiveRender, button) {return TranscriptService.encodeHTML(encodeLiveRender, button);}
        /* Functions ---------------------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Toolbar */
        /* -------------------------------------------------------------------------------- */
        function updateToolbar() {
            // Reset every enabled buttons
            for(let btn in $scope.transcriptArea.toolbar.tags) {
                $scope.transcriptArea.toolbar.tags[btn].btn.enabled = false;
            }

            if($scope.transcriptArea.ace.currentTag.name === null || $scope.transcriptArea.ace.currentTag.name === "") {
                // If the caret is at the root of the doc, we allow root items == true
                for(let btn in $scope.transcriptArea.toolbar.tags) {
                    if($scope.transcriptArea.toolbar.tags[btn].btn.allow_root === true) {
                        $scope.transcriptArea.toolbar.tags[btn].btn.enabled = true;
                    }
                }
            } else {
                // Else, we allow items according to the parent tag
                if($scope.teiInfo[$scope.transcriptArea.ace.currentTag.name] !== undefined && $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].content !== undefined) {
                    for (let elemId in $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].content) {
                        let elem = $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].content[elemId];
                        //console.log(elem);
                        if ($scope.transcriptArea.toolbar.tags[elem] !== undefined &&
                            $scope.transcriptArea.toolbar.tags[elem].xml.name === elem) {
                            $scope.transcriptArea.toolbar.tags[elem].btn.enabled = true;
                        }
                    }
                }
            }
        }

        /**
         * This functions aims to count the number of enabled button for a group
         * -> Used to disable or enable the dropdown
         *
         * @param group string
         * @return integer
         */
        $scope.transcriptArea.toolbar.nbEnabledButtonsForGroup = function(group) {
            let count = 0;
            for(let btn in $scope.transcriptArea.toolbar.tags) {
                if($scope.transcriptArea.toolbar.tags[btn].btn.btn_group === group && $scope.transcriptArea.toolbar.tags[btn].btn.enabled === true) {
                    count += 1;
                }
            }

            return count;
        };
        /* Toolbar ------------------------------------------------------------------------ */

        /* -------------------------------------------------------------------------------- */
        /* Ace Editor */
        /* -------------------------------------------------------------------------------- */
        /**
         * On loading the Ace inteface
         * @param _editor
         */
        $scope.aceLoaded = function(_editor) {
            $scope.aceEditor = _editor; // Doc -> https://ace.c9.io/#nav=api&api=editor
            $scope.aceSession = _editor.getSession(); // Doc -> https://ace.c9.io/#nav=api&api=edit_session
            let AceRange = $scope.aceEditor.getSelectionRange().constructor; //Doc -> https://stackoverflow.com/questions/28893954/how-to-get-range-when-using-angular-ui-ace#28894262

            /**
             * Adding a specific command on Enter
             * -> Insert a <lb /> tag
             */
            $scope.aceEditor.commands.addCommand({
                name: 'enterLb',
                bindKey: {win: 'Enter',  mac: 'Enter'},
                exec: function(editor) {
                    /*let lineNumber = $scope.aceEditor.getCursorPosition().row,
                        column = $scope.aceEditor.getCursorPosition().column;
                    console.log(editor);
                    console.log(lineNumber+"<>"+column);
                    console.log(editor.getValue());*/

                    console.log($scope.transcriptArea.toolbar.tags.lb.btn.enabled);
                    if($scope.transcriptArea.toolbar.tags.lb.btn.enabled === true) {
                        editor.insert("<lb />\n");
                    } else {
                        return false;
                    }
                }
            });

            /**
             * For every position movement, we recompute the parent tag
             */
            $scope.aceEditor.commands.addCommand({
                name: 'leftAction',
                bindKey:
                    {
                        win: 'Left',  mac: 'Left'
                    },
                exec: function() {
                    $scope.$apply(function() {
                        $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength()-1));
                    });
                    return false;
                }
            });
            $scope.aceEditor.commands.addCommand({
                name: 'rightAction',
                bindKey:
                    {
                        win: 'Right',  mac: 'Right'
                    },
                exec: function() {
                    $scope.$apply(function() {
                        $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength()-1));
                    });
                    return false;
                }
            });
            $scope.aceEditor.commands.addCommand({
                name: 'upAction',
                bindKey:
                    {
                        win: 'Up',  mac: 'Up'
                    },
                exec: function() {
                    $scope.$apply(function() {
                        $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength()-1));
                    });
                    return false;
                }
            });
            $scope.aceEditor.commands.addCommand({
                name: 'downAction',
                bindKey:
                    {
                        win: 'Down',  mac: 'Down'
                    },
                exec: function() {
                    $scope.$apply(function() {
                        $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength()-1));
                    });
                    return false;
                }
            });

            /**
             * Event double click
             */
            $scope.aceEditor.container.addEventListener("dblclick", function(e) {
                e.preventDefault();

                /*
                 * If double-click on a tag, we load the interaction interface with the doc about this tag
                 * We detect tag by looking at the previous character. We assume if the character is < or /, this is a tag.
                 */
                let previousCharacter = $scope.aceSession.getDocument().getTextRange(new AceRange($scope.aceEditor.getSelectionRange().start.row, $scope.aceEditor.getSelectionRange().start.column-1, $scope.aceEditor.getSelectionRange().start.row, $scope.aceEditor.getSelectionRange().start.column));
                if(previousCharacter === '<' || previousCharacter === '/') {
                    $scope.transcriptArea.interaction.help($scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange()), "modelDoc", true);
                }

                return false;
            }, false);

            /**
             * Event click
             */
            $scope.aceEditor.container.addEventListener("click", function(e) {
                e.preventDefault();
                $scope.$apply(function() {
                    $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength()-1));
                });
                return false;
            }, false);

            $scope.aceUndoManager = $scope.aceSession.setUndoManager(new ace.UndoManager());
            $scope.aceEditor.focus();
            $scope.aceEditor.navigateFileEnd();
        };

        $scope.aceChanged = function() {
            /**
             * The aim of this function is to compute the value of currentTag
             * according to the context, meaning the position of the caret.
             */
            $scope.$watch('transcriptArea.ace.currentTag', function() {
                //console.log($scope.transcriptArea.ace.currentTag);
                updateToolbar();
                updateAttributes();
            });
        };

        /**
         * Actions on addTag
         */
        $scope.addTag = function(tagName) {
            let tag = $scope.transcriptArea.toolbar.tags[tagName],
                tagInsert = "",
                defaultAddChar = 2;

            if(tag.xml.unique === "true") {
                tagInsert = "<"+tag.xml.name+" />";
                defaultAddChar = 4;
            } else if(tag.xml.unique === "false") {
                tagInsert = "<" + tag.xml.name + ">"+$scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange())+"</" + tag.xml.name + ">";
            }


            //console.log($scope.aceEditor.getCursorPosition());
            let lineNumber = $scope.aceEditor.getCursorPosition().row,
                column = $scope.aceEditor.getCursorPosition().column+tag.xml.name.length+defaultAddChar;
            //console.log(lineNumber+"<>"+column);

            $scope.aceEditor.insert(tagInsert);
            $scope.aceEditor.getSelection().moveCursorTo(lineNumber, column);
            $scope.aceEditor.focus();
            $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength()-1));
        };

        /**
         * This function watches the transcription (ace area), encodes it and displays it in the live
         */
        $scope.$watch('transcriptArea.ace.area', function() {
            let encodeLiveRender = $scope.transcriptArea.ace.area;
            for(let buttonId in $scope.transcriptArea.toolbar.tags) {
                encodeLiveRender = encodeHTML(encodeLiveRender, $scope.transcriptArea.toolbar.tags[buttonId]);
            }
            $scope.transcriptArea.interaction.live.content = $sce.trustAsHtml(encodeLiveRender);
            $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor());
        });

        /**
         * Undo management
         * @param direction
         */
        $scope.undo = function(direction) {
            if(direction === "prev") {
                $scope.aceEditor.undo();
            } else if(direction === "next" === true) {
                $scope.aceEditor.redo();
            }
        };
        /* Ace editor --------------------------------------------------------------------- */

        /* --------------------------------------------------------------------------------
         * XML Parser :
         * Find the current tag in AceEditor
         * ----------------------------------------------------------------------------- */
        function getLeftOfCursor() {
            let partOfCode = "";

            for (let r=0; r <= $scope.aceEditor.getCursorPosition().row; r++) {
                if (r < $scope.aceEditor.getCursorPosition().row) {
                    partOfCode += $scope.aceSession.getLine(r);
                } else if (r === $scope.aceEditor.getCursorPosition().row) {
                    let line = $scope.aceSession.getLine(r);
                    partOfCode += line.substring(0, $scope.aceEditor.getCursorPosition().column);
                }
            }

            //console.log(partOfCode);
            if(partOfCode !== "") {
                return partOfCode;
            } else {
                return null;
            }
        }
        /* End : XmlTagInterpreter -------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Attributes Management */
        /* -------------------------------------------------------------------------------- */
        function updateAttributes() {
            $scope.transcriptArea.toolbar.attributes = [];

            if($scope.teiInfo[$scope.transcriptArea.ace.currentTag.name] !== undefined && $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].attributes !== undefined) {
                //console.log($scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].attributes);
                $scope.transcriptArea.toolbar.attributes = $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].attributes;
            }
        }

        /**
         * Actions on addAttribute
         */
        $scope.transcriptArea.ace.addAttribute = function(attribute, value) {
            let attributeInsert = " " + attribute.id + "=\"\"";
            if(value !== null) {
                attributeInsert = " " + attribute.id + "=\""+value.value+"\"";
            }

            $scope.aceSession.insert({row: $scope.transcriptArea.ace.currentTag.position.end.row, column: $scope.transcriptArea.ace.currentTag.position.end.column}, attributeInsert);
            $scope.aceEditor.focus();
            $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength()-1));
        };

        /* End : Attributes Management ---------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Interaction Management */
        /* -------------------------------------------------------------------------------- */
        $scope.transcriptArea.interaction.gotoLive = function() {
            $scope.transcriptArea.interaction.status = 'live';
            resetVersionZone();
            resetContentZone();
            resetTaxonomySearchZone();
            resetDocZone();
        };

        function resetVersionZone() {
            $scope.transcriptArea.interaction.version.content = null;
            $scope.transcriptArea.interaction.version.id = null;
        }

        function resetContentZone() {
            $scope.transcriptArea.interaction.content.text = '<p class="text-center" style="margin-top: 20px;"><i class="fa fa-5x fa-spin fa-circle-o-notch"></i></p>';
        }

        function resetTaxonomySearchZone() {
            $scope.transcriptArea.interaction.taxonomy.dataType = null;
            $scope.transcriptArea.interaction.taxonomy.result = null;
            $scope.transcriptArea.interaction.taxonomy.string = null;
            $scope.transcriptArea.interaction.taxonomy.entities = null;
            $scope.transcriptArea.interaction.taxonomy.taxonomySelected = null;
        }

        function resetDocZone() {
            $scope.transcriptArea.interaction.doc.structure = null;
            $scope.transcriptArea.interaction.doc.title = null;
            $scope.transcriptArea.interaction.doc.element = null;
        }
        /* Interaction Management --------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Documentation Management */
        /* -------------------------------------------------------------------------------- */
        /**
         * This function loads documentation about a TEI element
         */
        function loadDocumentation(element) {
            console.log(element);
            $scope.$apply(function() {
                $scope.transcriptArea.interaction.doc.title = element;
                $scope.transcriptArea.interaction.doc.element = element;
                if($scope.teiInfo[element] !== undefined && $scope.teiInfo[element].doc !== undefined) {
                    if($scope.teiInfo[element].doc.gloss.length === 1) {
                        $scope.transcriptArea.interaction.doc.title = $scope.teiInfo[element].doc.gloss[0].content;
                    }

                    $scope.transcriptArea.interaction.doc.structure = $scope.teiInfo[element].doc;

                    if($scope.transcriptArea.interaction.doc.structure.exemplum !== undefined) {
                        for (let idExample in $scope.transcriptArea.interaction.doc.structure.exemplum) {
                            $scope.transcriptArea.interaction.doc.structure.exemplum[idExample] = $scope.transcriptArea.interaction.doc.structure.exemplum[idExample].replace('<egXML xmlns="http://www.tei-c.org/ns/Examples">', '').replace('</egXML>', '').replace(/\s+/g, " ");
                        }
                    } else {
                        $scope.transcriptArea.interaction.doc.structure.exemplum = [];
                    }

                    if($scope.transcriptArea.interaction.doc.structure.descriptions === undefined) {
                        $scope.transcriptArea.interaction.doc.structure.descriptions = [];
                    }
                }
                $scope.transcriptArea.interaction.status = 'doc';
            });
        }
        /* Documentation Management ------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Help Management */
        /* -------------------------------------------------------------------------------- */
        /**
         * Help management
         * @param string
         * @param context
         * @param resetBreadcrumb
         */
        $scope.transcriptArea.interaction.help = function(string, context, resetBreadcrumb) {
            if(context === "helpContent") {
                if(resetBreadcrumb === true) {
                    resetContentZone();
                }
                loadHelpData(string, resetBreadcrumb);
                $scope.transcriptArea.interaction.status = 'content';
            } else if(context === "modelDoc") {
                loadDocumentation(string);
            }
        };

        /**
         * Loading contents of type helpContent
         * @param file
         * @param resetBreadcrumb boolean
         */
        function loadHelpData(file, resetBreadcrumb) {
            return ContentService.getContent(file).then(function(data) {
                let doc = document.createElement('div');
                doc.innerHTML = data.content;

                // -- Encoding internal links to be clickable
                let links = doc.getElementsByTagName("a");
                for(let oldLink of links){
                    if(oldLink.getAttribute("class").indexOf("internalHelpLink") !== -1 ){
                        let newLink = document.createElement("a");
                        newLink.setAttribute('data-ng-click', 'transcriptArea.interaction.help(\''+oldLink.getAttribute('href')+'\', \'helpContent\', false)');
                        newLink.innerHTML = oldLink.innerHTML;
                        oldLink.parentNode.insertBefore(newLink, oldLink);
                        oldLink.parentNode.removeChild(oldLink);
                    }
                }

                $scope.transcriptArea.interaction.content.text = doc.innerHTML;
                $scope.transcriptArea.interaction.content.title = data.title;
                breadcrumbManagement(data, resetBreadcrumb);
            });
        }

        /**
         * Building breadcrumb for the interaction area
         * @param content
         * @param reset
         */
        function breadcrumbManagement(content, reset) {
            let elementToBreadcrumb = {
                title: content.title,
                id: content.id
            };

            //console.log(reset);
            if(reset === true) {
                // If reset === true -> we clean the history
                $scope.transcriptArea.interaction.content.history = [];
            } else {
                // Else -> we keep the history and we remove the previous items from history which are no longer relevant
                let toSplice = [];
                for (let elementOfHistory of $scope.transcriptArea.interaction.content.history) {
                    if (elementOfHistory.id === elementToBreadcrumb.id) {
                        toSplice.push($scope.transcriptArea.interaction.content.history.indexOf(elementOfHistory));
                    } else {
                        for (let parent of elementOfHistory.parents) {
                            if (parent === elementToBreadcrumb.id) {
                                toSplice.push($scope.transcriptArea.interaction.content.history.indexOf(elementOfHistory));
                            }
                        }
                    }
                }
                for (let id of toSplice.sort(function (a, b) {
                    return b - a
                })) {
                    $scope.transcriptArea.interaction.content.history.splice(id, 1);
                }
            }

            /* -- Building parents of current item -- */
            let parents = [];
            for(let elementOfHistory of $scope.transcriptArea.interaction.content.history) {
                parents.push(elementOfHistory.id);
            }
            elementToBreadcrumb.parents = parents;

            $scope.transcriptArea.interaction.content.history.push(elementToBreadcrumb);
        }
        /* Help Management ---------------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Versions Management */
        /* -------------------------------------------------------------------------------- */
        $scope.transcriptArea.interaction.version.load = function(id) {
            console.log(id);
            $scope.transcriptArea.interaction.version.id = id;
            $scope.transcriptArea.interaction.status = 'version';

            for(let versionId in $scope.transcript._embedded.version) {
                let version = $scope.transcript._embedded.version[versionId];
                if(version.id === id) {
                    $scope.transcriptArea.interaction.version.content = version.data.content;
                }
            }
        };
        /* Versions Management ------------------------------------------------------------ */

        /* -------------------------------------------------------------------------------- */
        /* Taxonomy Search Management */
        /* -------------------------------------------------------------------------------- */
        $scope.transcriptArea.interaction.taxonomy.action = function() {
            resetTaxonomySearchZone();
            $scope.transcriptArea.interaction.status = 'taxonomySearch';

            $scope.$watch('transcriptArea.interaction.taxonomy.taxonomySelected', function() {
                switch($scope.transcriptArea.interaction.taxonomy.taxonomySelected) {
                    case "testators":
                        console.log("testators");
                        $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.testators;
                        $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.testators, "name", "string");
                        $scope.transcriptArea.interaction.taxonomy.dataType = "testators";
                        break;
                    case "places":
                        console.log("places");
                        $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.places;
                        $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.places, "name", "string");
                        $scope.transcriptArea.interaction.taxonomy.dataType = "places";
                        break;
                    case "regiments":
                        console.log("regiments");
                        $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.regiments;
                        $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.regiments, "name", "string");
                        $scope.transcriptArea.interaction.taxonomy.dataType = "regiments";
                        break;
                    default:
                        console.log("default");
                        $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.testators;
                        $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.testators, "name", "string");
                        $scope.transcriptArea.interaction.taxonomy.dataType = "testators";
                }
            });
            $scope.$watch('transcriptArea.interaction.taxonomy.string', function() {
                if($scope.transcriptArea.interaction.taxonomy.string !== undefined) {
                    if ($scope.transcriptArea.interaction.taxonomy.string !== null && $scope.transcriptArea.interaction.taxonomy.string !== "" && $scope.transcriptArea.interaction.taxonomy.string.originalObject !== undefined) {
                        $scope.transcriptArea.interaction.taxonomy.string = $scope.transcriptArea.interaction.taxonomy.string.originalObject.value;
                        console.log($scope.transcriptArea.interaction.taxonomy.string);
                    }
                    refresh();
                }
            });

            function refresh() {
                let toEntities = $scope.transcriptArea.interaction.taxonomy.entities;
                let toForm = {name: $scope.transcriptArea.interaction.taxonomy.string};
                $scope.transcriptArea.interaction.taxonomy.result = SearchService.search(toEntities, toForm);
                console.log($scope.transcriptArea.interaction.taxonomy.result);
            }
        };
        /* Taxonomy Search Management ---------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Viewer Management */
        /* -------------------------------------------------------------------------------- */
        /*
            https://github.com/nfabre/deepzoom.php
            https://openseadragon.github.io/docs/
            $scope.openseadragon = {

            prefixUrl: $rootScope.webapp.resources+"libraries/js/openseadragon/images/",
            tileSources: {
                Image: {
                    xmlns:    "http://schemas.microsoft.com/deepzoom/2008",
                    Url:      $rootScope.api_web+"/images/data/testament_"+$scope.entity.will_number+"/JPEG/FRAN_Poilus_t-"+$scope.entity.will_number+"_"+$scope.resource.images[0],
                    Format:   "jpg",
                    Overlap:  "2",
                    TileSize: "256",
                    Size: {
                        Height: "9221",
                        Width:  "7026"
                    }
                }
            }
        };*/
        /* Viewer Management -------------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Submit Management */
        /* -------------------------------------------------------------------------------- */
        /**
         * Submit management
         */
        $scope.submit.load = function(action) {
            if($scope.transcript.status === "todo" && $scope.transcriptArea.ace.area !== "") {
                // Updating status value in case of first edition
                $scope.transcript.status = "transcription";
            }
            if($scope.transcript.content !== $scope.transcriptArea.ace.area) {
                $scope.submit.loading = true;
                if($scope.submit.form.isEnded === true) {
                    $scope.transcript.status = "validation";
                }
                $http.patch($rootScope.api+'/transcripts/' + $scope.transcript.id,
                    {
                        "content": $scope.transcriptArea.ace.area,
                        "updateComment": $scope.submit.form.comment,
                        "status": $scope.transcript.status
                    },
                    {headers: {'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token}}
                ).then(function (response) {
                    console.log(response.data);
                    $scope.transcript = response.data;
                    $scope.submit.loading = false;
                    $scope.submit.form.isEnded = false;
                    $scope.submit.form.comment = "";

                    if(action === 'load-read' || $scope.transcript.status === "validation") {
                        $state.go('app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
                    } else {
                        $scope.submit.success = true;
                        $timeout(function() { $scope.submit.success = false; }, 3000);
                    }
                });
            } else {
                alert('It seems you didn\'t edit anything.')
            }
        };

        /**
         * Go back management
         */
        $scope.submit.goBack = function() {
            if($scope.transcript.content === $scope.transcriptArea.ace.area) {
                $state.go('app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
            } else {
                $scope.transcriptArea.ace.modal.load('goBack');
            }
        };

        /**
         * Safe go back management
         */
        $scope.submit.safeGoBack = function() {
            $scope.transcriptArea.ace.area = $scope.transcript.content;
            $state.go('app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
        };
        /* Submit Management -------------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Admin Management */
        /* -------------------------------------------------------------------------------- */
        /**
         * Admin init:
         */
        function adminInit() {
            $scope.admin.status.show = false;
        }

        /**
         * Management of status loading
         */
        $scope.admin.status.load = function() {
            if($scope.admin.status.show === false) {
                adminInit();
                $scope.admin.status.show = true;
            } else if($scope.admin.status.show === true) {
                $scope.admin.status.show = false;
            }
        };

        /**
         * Status management
         */
        $scope.admin.status.submit = function() {
            $scope.admin.status.loading = true;
            $http.patch($rootScope.api+'/transcripts/'+$scope.transcript.id,
                {
                    "updateComment": "Edit status to "+$scope.admin.status.value,
                    "status": $scope.admin.status.value
                },
                {headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
            ).then(function (response) {
                console.log(response.data);
                $scope.transcript = response.data;
                $scope.admin.status.loading = false;
                $state.go('app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
            });
        };

        /**
         * Validation accept management
         */
        $scope.admin.validation.accept.load = function() {
            $scope.admin.validation.accept.loading = true;
            $http.patch($rootScope.api+'/transcripts/'+$scope.transcript.id,
                {
                    "content": $scope.transcriptArea.ace.area,
                    "updateComment": "Accept validation",
                    "status": "validated"
                },
                {headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
            ).then(function (response) {
                console.log(response.data);
                $scope.transcript = response.data;
                $scope.admin.validation.accept.loading = false;
                $state.go('app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
            });
        };

        /**
         * Validation refuse management
         */
        $scope.admin.validation.refuse.load = function() {
            $scope.admin.validation.refuse.loading = true;
            $http.patch($rootScope.api+'/transcripts/'+$scope.transcript.id,
                {
                    "content": $scope.transcriptArea.ace.area,
                    "updateComment": "Refuse validation",
                    "status": "transcription"
                },
                {headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
            ).then(function (response) {
                console.log(response.data);
                $scope.transcript = response.data;
                $scope.admin.validation.refuse.loading = false;
                $state.go('app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
            });
        };
        /* Admin Management --------------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Full screen Management */
        /* -------------------------------------------------------------------------------- */
        let fullscreenDiv    = document.getElementById("transcriptContainerFullScreen");
        let fullscreenFunc   = fullscreenDiv.requestFullscreen;
        if (!fullscreenFunc) {
            ['mozRequestFullScreen',
                'msRequestFullscreen',
                'webkitRequestFullScreen'].forEach(function (req) {
                fullscreenFunc = fullscreenFunc || fullscreenDiv[req];
            });
        }

        $scope.page.fullscreen.open = function() {
            console.log('fullscreen');
            fullscreenFunc.call(fullscreenDiv);
            $scope.page.fullscreen.status = true;
        };

        $scope.page.fullscreen.close = function() {
            document.exitFullscreen();
            $scope.page.fullscreen.status = false;
        };
        /* Full screen Management --------------------------------------------------------- */
    }])
;