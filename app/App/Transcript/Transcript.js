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
                parent: 'app.entity({id: resource.entity.id})',
                label: 'Transcription de {{ resource.type }} {{resource.order_in_will}}'
            },
            url: '/transcript/{id}',
            resolve: {
                transcript: function(TranscriptService, $transition$) {
                    return TranscriptService.getTranscript($transition$.params().id);
                },
                resource: function(ResourceService, $transition$) {
                    return ResourceService.getResource($transition$.params().id);
                },
                thread: function(CommentService, $transition$) {
                    if(CommentService.getThread('transcript-'+$transition$.params().id) === null) {
                        CommentService.postThread('transcript-'+$transition$.params().id);
                        return CommentService.getThread('transcript-'+$transition$.params().id);
                    } else {
                        return CommentService.getThread('transcript-'+$transition$.params().id);
                    }
                }
            }
        })
    }])

    .controller('AppTranscriptCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'transcript', 'resource', 'TranscriptService', 'ContentService', '$timeout', function($rootScope, $scope, $http, $sce, $state, transcript, resource, TranscriptService, ContentService, $timeout) {
        /* -------------------------------------------------------------------------------- */
        /* $scope & variables */
        /* -------------------------------------------------------------------------------- */
        let config = YAML.load('App/Transcript/toolbar.yml');
        $scope.page = {
            loading: true,
            status: "read",
            fullscreen: {
                status: false
            }
        };
        $scope.wysiwyg = {
            live: {
                status: true,
                content: ""
            },
            interaction: {
                title: "",
                content: "",
                history: []
            },
            area: transcript.content,
            buttons: config.tei,
            buttonsGroups: config.buttonsGroups,
            modal: {
                content: "",
                variables: {}
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
            versions: {
                show: false
            },
            status: {
                show: false,
                loading: false,
                value: transcript.status
            }
        };
        $scope.transcript = transcript;
        $scope.role = TranscriptService.getTranscriptRights($rootScope.user);
        $scope.resource = resource;
        if(transcript.content === null) {$scope.wysiwyg.area = "";}
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

        $scope.page.loading = false;

        /* -------------------------------------------------------------------------------- */
        /* Ace Editor */
        /* -------------------------------------------------------------------------------- */
        /**
         * On loading page
         * @param _editor
         */
        $scope.aceLoaded = function(_editor) {
            $scope.aceEditor = _editor;
            $scope.aceSession = _editor.getSession();

            $scope.aceEditor.commands.addCommand({
                name: 'enterLb',
                bindKey: {win: 'Enter',  mac: 'Enter'},
                exec: function(editor) {
                    let lineNumber = $scope.aceEditor.getCursorPosition().row,
                        column = $scope.aceEditor.getCursorPosition().column;


                    console.log(editor);
                    console.log(lineNumber+"<>"+column);

                    console.log(editor.getValue());


                    editor.insert("<lb />\n");
                }
            });

            $scope.aceEditor.container.addEventListener("dblclick", function(e) {
                e.preventDefault();
                if(config.list.indexOf($scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange())) !== -1) {
                    $scope.help($scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange()), "modelDoc", true);
                }
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
            let tag = config.tei[tagName],
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
            let attribute = config.tei[attributeName],
                defaultAddChar = 8;

            let attrInsert = "<hi " + attribute.xml.name + "=\"" + attribute.xml.value + "\">" + $scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange()) + "</hi>";

            let lineNumber = $scope.aceEditor.getCursorPosition().row,
                column = $scope.aceEditor.getCursorPosition().column+attribute.xml.name.length+attribute.xml.value.length+defaultAddChar;
            $scope.aceEditor.insert(attrInsert);
            $scope.aceEditor.getSelection().moveCursorTo(lineNumber, column);
            $scope.aceEditor.focus();
        };

        /**
         * This function watches #live.content, encodes it and displays it
         */
        $scope.$watch('wysiwyg.area', function() {
            let encodeLiveRender = $scope.wysiwyg.area;
            for(let buttonId in config.tei) {
                encodeLiveRender = encodeHTML(encodeLiveRender, config.tei[buttonId]);
            }
            $scope.wysiwyg.live.content = $sce.trustAsHtml(encodeLiveRender);
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

        /* -------------------------------------------------------------------------------- */
        /* Modal Management */
        /* -------------------------------------------------------------------------------- */
        /**
         * Modal management
         * @param id_modal
         */
        $scope.wysiwyg.modal.load = function(id_modal) {
            $scope.wysiwyg.modal.setContent(id_modal);
            $("#transcript-edit-modal").modal();
            $(".modal-backdrop").appendTo("#transcript-edit");
            $("body").removeClass();
        };

        $scope.wysiwyg.modal.setContent = function(id_modal) {
            // Reset variables :
            if(id_modal === "choice-orig") {
                $scope.wysiwyg.modal.variables.choice_orig_modal_orig = "";
                $scope.wysiwyg.modal.variables.choice_orig_modal_reg = "";
                $scope.wysiwyg.modal.variables.choice_orig_modal_orig = $scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange());
            }

            $scope.wysiwyg.modal.content = TranscriptService.loadFile("modal-"+id_modal);
        };

        /**
         * Modal validation
         * @param id_validation
         */
        $scope.wysiwyg.modal.valid = function(id_validation) {
            $('.modal').modal('hide');
            if(id_validation === "choice-orig") {
                let orig_insertHTML = "",
                    reg_insertHTML = "";

                if($scope.wysiwyg.modal.variables.choice_orig_modal_orig !== "") {orig_insertHTML = "<orig>"+$scope.wysiwyg.modal.variables.choice_orig_modal_orig+"</orig>";}
                else {orig_insertHTML = "<orig />";}
                if($scope.wysiwyg.modal.variables.choice_orig_modal_reg !== "") {reg_insertHTML = "<reg>"+$scope.wysiwyg.modal.variables.choice_orig_modal_reg+"</reg>";}
                else {reg_insertHTML = "<reg />";}

                let insertXML = "<choice>"+orig_insertHTML+reg_insertHTML+"</choice>";
                $scope.aceEditor.insert(insertXML);
            }
            $scope.aceEditor.focus();
        };
        /* Modal Management --------------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Help Management */
        /* -------------------------------------------------------------------------------- */
        function resetInteractionZone() {
            $scope.wysiwyg.interaction.content = '<p class="text-center" style="margin-top: 20px;"><i class="fa fa-5x fa-spin fa-circle-o-notch"></i></p>';
        }
        /**
         * Help management
         * @param string
         * @param context
         * @param resetBreadcrumb
         */
        $scope.help = function(string, context, resetBreadcrumb) {
            if(context === "helpContent") {
                if(resetBreadcrumb === true) {
                    resetInteractionZone();
                }
                loadHelpData(string, resetBreadcrumb);
            } else if(context === "modelDoc") {
                resetInteractionZone(resetBreadcrumb);
                loadDocumentation(string, resetBreadcrumb);
            }
            $scope.wysiwyg.live.status = false;
        };

        /**
         * This function loads documentation about a TEI element
         */
        function loadDocumentation(element, resetBreadcrumb) {
            $http.get($rootScope.api+'/model?info=doc&element=' + element, { headers: {'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token }}
            ).then(function (response) {
                //console.log(response.data);
                if(response.data.doc !== null) {
                    $scope.wysiwyg.interaction.content = response.data.doc;
                } else {
                    $scope.wysiwyg.interaction.content = "Oups ... Aucune documentation n'existe pour cet élément.";
                }
                $scope.wysiwyg.interaction.title = element;
                breadcrumbManagement({title: element, id: 0}, resetBreadcrumb);
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

                //-------------------------------------------------------------
                // -- Encoding internal links to be clickable
                let links = doc.getElementsByTagName("a");
                for(let oldLink of links){
                    if(oldLink.getAttribute("class").indexOf("internalHelpLink") !== -1 ){
                        let newLink = document.createElement("a");
                        newLink.setAttribute('data-ng-click', 'help(\''+oldLink.getAttribute('href')+'\', \'helpContent\', false)');
                        newLink.innerHTML = oldLink.innerHTML;
                        oldLink.parentNode.insertBefore(newLink, oldLink);
                        oldLink.parentNode.removeChild(oldLink);
                    }
                }
                //-------------------------------------------------------------

                $scope.wysiwyg.interaction.content = doc.innerHTML;
                $scope.wysiwyg.interaction.title = data.title;
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

            console.log(reset);
            if(reset === true) {
                // If reset === true -> we clean the history
                $scope.wysiwyg.interaction.history = [];
            } else {
                // Else -> we keep the history and we remove the previous items from history which are no longer relevant
                let toSplice = [];
                for (let elementOfHistory of $scope.wysiwyg.interaction.history) {
                    if (elementOfHistory.id === elementToBreadcrumb.id) {
                        toSplice.push($scope.wysiwyg.interaction.history.indexOf(elementOfHistory));
                    } else {
                        for (let parent of elementOfHistory.parents) {
                            if (parent === elementToBreadcrumb.id) {
                                toSplice.push($scope.wysiwyg.interaction.history.indexOf(elementOfHistory));
                            }
                        }
                    }
                }
                for (let id of toSplice.sort(function (a, b) {
                    return b - a
                })) {
                    $scope.wysiwyg.interaction.history.splice(id, 1);
                }
            }

            /* -- Building parents of current item -- */
            let parents = [];
            for(let elementOfHistory of $scope.wysiwyg.interaction.history) {
                parents.push(elementOfHistory.id);
            }
            elementToBreadcrumb.parents = parents;

            $scope.wysiwyg.interaction.history.push(elementToBreadcrumb);
        }
        /* Help Management ---------------------------------------------------------------- */

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
                    Url:      $rootScope.api_web+"/images/data/testament_"+$scope.resource.entity.will_number+"/JPEG/FRAN_Poilus_t-"+$scope.resource.entity.will_number+"_"+$scope.resource.images[0],
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
            if($scope.transcript.status === "todo" && $scope.wysiwyg.area !== "") {
                // Updating status value in case of first edition
                $scope.transcript.status = "transcription";
            }
            if($scope.transcript.content !== $scope.wysiwyg.area) {
                $scope.submit.loading = true;
                if($scope.submit.form.isEnded === true) {
                    $scope.transcript.status = "validation";
                }
                $http.patch($rootScope.api+'/transcripts/' + $scope.transcript.id,
                    {
                        "content": $scope.wysiwyg.area,
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
                        $scope.page.status = 'read';
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
            if($scope.transcript.content === $scope.wysiwyg.area) {
                $scope.page.status = 'read';
            } else {
                $scope.wysiwyg.modal.load('goBack');
            }
        };

        /**
         * Safe go back management
         */
        $scope.submit.safeGoBack = function() {
            $scope.wysiwyg.area = $scope.transcript.content;
            $scope.page.status = 'read';
        };
        /* Submit Management -------------------------------------------------------------- */

        /* -------------------------------------------------------------------------------- */
        /* Admin Management */
        /* -------------------------------------------------------------------------------- */
        /**
         * Admin init:
         */
        function adminInit() {
            $scope.admin.versions.show = false;
            $scope.admin.status.show = false;
        }

        /**
         * Management of versions loading
         */
        $scope.admin.versions.load = function() {
            if($scope.admin.versions.show === false) {
                adminInit();
                $scope.admin.versions.show = true;
            } else if($scope.admin.versions.show === true) {
                $scope.admin.versions.show = false;
            }
        };

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
                $scope.page.status = 'read';
            });
        };

        /**
         * Validation accept management
         */
        $scope.admin.validation.accept.load = function() {
            $scope.admin.validation.accept.loading = true;
            $http.patch($rootScope.api+'/transcripts/'+$scope.transcript.id,
                {
                    "content": $scope.wysiwyg.area,
                    "updateComment": "Accept validation",
                    "status": "validated"
                },
                {headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
            ).then(function (response) {
                console.log(response.data);
                $scope.transcript = response.data;
                $scope.admin.validation.accept.loading = false;
                $scope.page.status = 'read';
            });
        };

        /**
         * Validation refuse management
         */
        $scope.admin.validation.refuse.load = function() {
            $scope.admin.validation.refuse.loading = true;
            $http.patch($rootScope.api+'/transcripts/'+$scope.transcript.id,
                {
                    "content": $scope.wysiwyg.area,
                    "updateComment": "Refuse validation",
                    "status": "transcription"
                },
                {headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
            ).then(function (response) {
                console.log(response.data);
                $scope.transcript = response.data;
                $scope.admin.validation.refuse.loading = false;
                $scope.page.status = 'read';
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
        }
        /* Full screen Management --------------------------------------------------------- */

    }])
;