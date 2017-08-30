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
                    if(CommentService.getThread('transcript-'+$transition$.params().id) === null) {
                        CommentService.postThread('transcript-'+$transition$.params().id);
                        return CommentService.getThread('transcript-'+$transition$.params().id);
                    } else {
                        return CommentService.getThread('transcript-'+$transition$.params().id);
                    }
                },
                teiStructure: function(TranscriptService) {
                    return TranscriptService.getTeiStructure();
                },
                teiHelp: function(TranscriptService) {
                    return TranscriptService.getTeiHelp();
                },
                config: function() {
                    return YAML.load('App/Transcript/toolbar.yml');
                },
                testators: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities("testators");
                },
                places: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities("places");
                },
                regiments: function(ThesaurusService) {
                    return ThesaurusService.getThesaurusEntities("regiments");
                }
            }
        })
    }])

    .controller('AppTranscriptCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$timeout', 'TranscriptService', 'ContentService', 'SearchService', 'entity', 'resource', 'transcript', 'teiStructure', 'teiHelp', 'config', 'testators', 'places', 'regiments', function($rootScope, $scope, $http, $sce, $state, $timeout, TranscriptService, ContentService, SearchService, entity, resource, transcript, teiStructure, teiHelp, config, testators, places, regiments) {
        /* -------------------------------------------------------------------------------- */
        /* $scope & variables */
        /* -------------------------------------------------------------------------------- */
        $scope.transcript = transcript;
        $scope.resource = resource;
        $scope.entity = entity;
        $scope.teiStructure = teiStructure;
        $scope.teiHelp = teiHelp;
        $scope.config = config;
        $scope.thesaurus = {
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
                    history: [],
                },
                thesaurus: {
                    result: null,
                    dataType: null,
                    entities: null,
                    string: null,
                    thesaurusSelected: null
                },
                version: {
                    id: null,
                    content: null
                }
            },
            ace: {
                currentTag: null,
                area: $scope.transcript.content,
                modal: {
                    content: "",
                    variables: {}
                }
            },
            toolbar: {
                buttons: $scope.config.tei,
                buttonsGroups: $scope.config.buttonsGroups,

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
        /**
         * The aim of this function is to enable and disable the buttons of the TEI toolbar
         * according to the context, meaning the position of the caret.
         */
        $scope.$watch('transcriptArea.ace.currentTag', function() {
            //console.log($scope.transcriptArea.ace.currentTag);
            //console.log($scope.teiStructure);

            // Reset every disabled buttons
            for(let btn in $scope.transcriptArea.toolbar.buttons) {
                $scope.transcriptArea.toolbar.buttons[btn].btn.disabled = true;
            }

            if($scope.transcriptArea.ace.currentTag === null || $scope.transcriptArea.ace.currentTag === "") {
                // If the caret is at the root of the doc, we allow root items == true
                for(let btn in $scope.transcriptArea.toolbar.buttons) {
                    if($scope.transcriptArea.toolbar.buttons[btn].btn.allow_root === true) {
                        $scope.transcriptArea.toolbar.buttons[btn].btn.disabled = false;
                    }
                }
            } else {
                // Else, we allow items according to the parent tag
                for(let elemId in $scope.teiStructure.data[$scope.transcriptArea.ace.currentTag]) {
                    let elem = $scope.teiStructure.data[$scope.transcriptArea.ace.currentTag][elemId];
                    //console.log(elem);
                    if($scope.transcriptArea.toolbar.buttons[elem] !== undefined &&
                        ($scope.transcriptArea.toolbar.buttons[elem].type === 'tag' || $scope.transcriptArea.toolbar.buttons[elem].type === 'key') &&
                        $scope.transcriptArea.toolbar.buttons[elem].xml.name === elem)
                    {
                        $scope.transcriptArea.toolbar.buttons[elem].btn.disabled = false;
                    }
                }
            }

        });
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

                    console.log($scope.transcriptArea.toolbar.buttons.lb.btn.disabled);
                    if($scope.transcriptArea.toolbar.buttons.lb.btn.disabled == false) {
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
                        $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor());
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
                        $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor());
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
                        $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor());
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
                        $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor());
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
                    $scope.transcriptArea.ace.currentTag = TranscriptService.getParentTag(getLeftOfCursor());
                });
                return false;
            }, false);

            $scope.aceUndoManager = $scope.aceSession.setUndoManager(new ace.UndoManager());
            $scope.aceEditor.focus();
            $scope.aceEditor.navigateFileEnd();
        };

        /**
         * Actions on addTag
         */
        $scope.addTag = function(tagName) {
            let tag = $scope.config.tei[tagName],
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
        };

        /**
         * Actions on addAttribute
         */
        $scope.addAttribute = function(attributeName) {
            let attribute = $scope.config.tei[attributeName],
                defaultAddChar = 8;

            let attrInsert = "<hi " + attribute.xml.name + "=\"" + attribute.xml.value + "\">" + $scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange()) + "</hi>";

            let lineNumber = $scope.aceEditor.getCursorPosition().row,
                column = $scope.aceEditor.getCursorPosition().column+attribute.xml.name.length+attribute.xml.value.length+defaultAddChar;
            $scope.aceEditor.insert(attrInsert);
            $scope.aceEditor.getSelection().moveCursorTo(lineNumber, column);
            $scope.aceEditor.focus();
        };

        /**
         * This function watches the transcription (ace area), encodes it and displays it in the live
         */
        $scope.$watch('transcriptArea.ace.area', function() {
            let encodeLiveRender = $scope.transcriptArea.ace.area;
            for(let buttonId in $scope.config.tei) {
                encodeLiveRender = encodeHTML(encodeLiveRender, $scope.config.tei[buttonId]);
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
        /* End : XmlTagInterpreter --------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Modal Management */
        /* -------------------------------------------------------------------------------- */
        /**
         * Modal management
         * @param id_modal
         */
        $scope.transcriptArea.ace.modal.load = function(id_modal) {
            $scope.transcriptArea.ace.modal.setContent(id_modal);
            $("#transcript-edit-modal").modal();
            $(".modal-backdrop").appendTo("#transcript-edit");
            $("body").removeClass();
        };

        $scope.transcriptArea.ace.modal.setContent = function(id_modal) {
            // Reset variables :
            if(id_modal === "choice-orig") {
                $scope.transcriptArea.ace.modal.variables.choice_orig_modal_orig = "";
                $scope.transcriptArea.ace.modal.variables.choice_orig_modal_reg = "";
                $scope.transcriptArea.ace.modal.variables.choice_orig_modal_orig = $scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange());
            }

            $scope.transcriptArea.ace.modal.content = TranscriptService.loadFile("modal-"+id_modal);
        };

        /**
         * Modal validation
         * @param id_validation
         */
        $scope.transcriptArea.ace.modal.valid = function(id_validation) {
            $('.modal').modal('hide');
            if(id_validation === "choice-orig") {
                let orig_insertHTML = "",
                    reg_insertHTML = "";

                if($scope.transcriptArea.ace.modal.variables.choice_orig_modal_orig !== "") {orig_insertHTML = "<orig>"+$scope.transcriptArea.ace.modal.variables.choice_orig_modal_orig+"</orig>";}
                else {orig_insertHTML = "<orig />";}
                if($scope.transcriptArea.ace.modal.variables.choice_orig_modal_reg !== "") {reg_insertHTML = "<reg>"+$scope.transcriptArea.ace.modal.variables.choice_orig_modal_reg+"</reg>";}
                else {reg_insertHTML = "<reg />";}

                let insertXML = "<choice>"+orig_insertHTML+reg_insertHTML+"</choice>";
                $scope.aceEditor.insert(insertXML);
            }
            $scope.aceEditor.focus();
        };
        /* Modal Management --------------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Interaction Management */
        /* -------------------------------------------------------------------------------- */
        $scope.transcriptArea.interaction.gotoLive = function() {
            $scope.transcriptArea.interaction.status = 'live';
            resetVersionZone();
            resetInteractionZone();
            resetThesaurusSearchZone();
        };

        function resetVersionZone() {
            $scope.transcriptArea.interaction.version.content = null;
            $scope.transcriptArea.interaction.version.id = null;
        }

        function resetInteractionZone() {
            $scope.transcriptArea.interaction.content.text = '<p class="text-center" style="margin-top: 20px;"><i class="fa fa-5x fa-spin fa-circle-o-notch"></i></p>';
        }

        function resetThesaurusSearchZone() {
            $scope.transcriptArea.interaction.thesaurus.dataType = null;
            $scope.transcriptArea.interaction.thesaurus.result = null;
            $scope.transcriptArea.interaction.thesaurus.string = null;
            $scope.transcriptArea.interaction.thesaurus.entities = null;
            $scope.transcriptArea.interaction.thesaurus.thesaurusSelected = null;
        }
        /* Interaction Management --------------------------------------------------------- */

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
                    resetInteractionZone();
                }
                loadHelpData(string, resetBreadcrumb);
                $scope.transcriptArea.interaction.status = 'content';
            } else if(context === "modelDoc") {
                resetInteractionZone(resetBreadcrumb);
                loadDocumentation(string, resetBreadcrumb);
            }
        };

        /**
         * This function loads documentation about a TEI element
         */
        function loadDocumentation(element, resetBreadcrumb) {
            console.log(element);
            breadcrumbManagement({title: element, id: 0}, resetBreadcrumb);
            $scope.$apply(function() {
                $scope.transcriptArea.interaction.content.title = element;
                if($scope.teiHelp.data[element] !== undefined) {
                    $scope.transcriptArea.interaction.content.text = $scope.teiHelp.data[element];
                } else {
                    $scope.transcriptArea.interaction.content.text = "Oups ... Aucune documentation n'existe pour cet élément.";
                }
                $scope.transcriptArea.interaction.status = 'content';
            });
        }

        /**
         * Loading contents of type helpContent
         * @param file
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
        /* Thesaurus Search Management */
        /* -------------------------------------------------------------------------------- */
        $scope.transcriptArea.interaction.thesaurus.action = function() {
            resetThesaurusSearchZone();
            $scope.transcriptArea.interaction.status = 'thesaurusSearch';

            $scope.$watch('transcriptArea.interaction.thesaurus.thesaurusSelected', function() {
                switch($scope.transcriptArea.interaction.thesaurus.thesaurusSelected) {
                    case "testators":
                        console.log("testators");
                        $scope.transcriptArea.interaction.thesaurus.entities = $scope.thesaurus.testators;
                        $scope.transcriptArea.interaction.thesaurus.values = SearchService.dataset($scope.thesaurus.testators, "name", "string");
                        $scope.transcriptArea.interaction.thesaurus.dataType = "testators";
                        break;
                    case "places":
                        console.log("places");
                        $scope.transcriptArea.interaction.thesaurus.entities = $scope.thesaurus.places;
                        $scope.transcriptArea.interaction.thesaurus.values = SearchService.dataset($scope.thesaurus.places, "name", "string");
                        $scope.transcriptArea.interaction.thesaurus.dataType = "places";
                        break;
                    case "regiments":
                        console.log("regiments");
                        $scope.transcriptArea.interaction.thesaurus.entities = $scope.thesaurus.regiments;
                        $scope.transcriptArea.interaction.thesaurus.values = SearchService.dataset($scope.thesaurus.regiments, "name", "string");
                        $scope.transcriptArea.interaction.thesaurus.dataType = "regiments";
                        break;
                    default:
                        console.log("default");
                        $scope.transcriptArea.interaction.thesaurus.entities = $scope.thesaurus.testators;
                        $scope.transcriptArea.interaction.thesaurus.values = SearchService.dataset($scope.thesaurus.testators, "name", "string");
                        $scope.transcriptArea.interaction.thesaurus.dataType = "testators";
                }
            });
            $scope.$watch('transcriptArea.interaction.thesaurus.string', function() {
                if($scope.transcriptArea.interaction.thesaurus.string !== undefined) {
                    if ($scope.transcriptArea.interaction.thesaurus.string !== null && $scope.transcriptArea.interaction.thesaurus.string !== "" && $scope.transcriptArea.interaction.thesaurus.string.originalObject !== undefined) {
                        $scope.transcriptArea.interaction.thesaurus.string = $scope.transcriptArea.interaction.thesaurus.string.originalObject.value;
                        console.log($scope.transcriptArea.interaction.thesaurus.string);
                    }
                    refresh();
                }
            });

            function refresh() {
                let toEntities = $scope.transcriptArea.interaction.thesaurus.entities;
                let toForm = {name: $scope.transcriptArea.interaction.thesaurus.string};
                $scope.transcriptArea.interaction.thesaurus.result = SearchService.search(toEntities, toForm);
                console.log($scope.transcriptArea.interaction.thesaurus.result);
            }
        };
        /* Thesaurus Search Management ---------------------------------------------------- */

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