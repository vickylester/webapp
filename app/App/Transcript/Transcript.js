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
                resource: function(EntityService, $transition$) {
                    return EntityService.getResource($transition$.params().id);
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
            encodeHTML: function(encodeLiveRender, button) {
                let regex = "",
                    html = "";

                if(button.type === "tag") {
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
                    regex = new RegExp("<" + button.xml.name + " />", "g");
                    html = "<"+button.html.name+" />";
                    encodeLiveRender = encodeLiveRender.replace(regex, html);
                } else if(button.type === "attribute") {
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

    .controller('AppTranscriptCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'transcript', 'resource', 'TranscriptService', 'ContentService', function($rootScope, $scope, $http, $sce, $state, transcript, resource, TranscriptService, ContentService) {
        /* -------------------------------------------------------------------------------- */
        /* $scope & variables */
        /* -------------------------------------------------------------------------------- */
        console.log(resource);
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
            interaction: "",
            area: transcript.content,
            buttons: config.tei,
            buttonsGroups: config.buttonsGroups,
            modal: {
                content: "",
                variables: {}
            }
        };
        $scope.submit = {
            isLoading: false,
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
                    isLoading: false
                },
                refuse: {
                    isLoading: false
                }
            },
            versions: {
                show: false
            },
            status: {
                show: false,
                isLoading: false,
                value: transcript.status
            }
        };
        $scope.transcript = transcript;
        $scope.role = TranscriptService.getTranscriptRights($rootScope.user);
        $scope.resource = resource;
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
        /**
         * Help management
         * @param file
         */
        $scope.help = function(file) {
            loadHelpData(file);
            $scope.wysiwyg.live.status = false;

            function loadHelpData(file) {
                return ContentService.getContent(file).then(function(data) {
                    let doc = document.createElement('div');
                    doc.innerHTML = data.content;
                    let links = doc.getElementsByTagName("a");
                    for(let oldLink of links){
                        if(oldLink.getAttribute("class").indexOf("internalHelpLink") !== -1 ){
                            let newLink = document.createElement("a");
                            newLink.setAttribute('data-ng-click', 'help(\''+oldLink.getAttribute('href')+'\')');
                            newLink.innerHTML = oldLink.innerHTML;
                            oldLink.parentNode.insertBefore(newLink, oldLink);
                            oldLink.parentNode.removeChild(oldLink);
                        }
                    }
                    $scope.wysiwyg.interaction = doc.innerHTML;
                });
            }
        };
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
            if($scope.transcript.content !== $scope.wysiwyg.area) {
                $scope.submit.isLoading = true;
                if($scope.submit.form.isEnded === true) {
                    $scope.transcript.status = "validation";
                }
                $http.patch('http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/transcripts/' + $scope.transcript.id,
                    {
                        "content": $scope.wysiwyg.area,
                        "updateComment": $scope.submit.form.comment,
                        "status": $scope.transcript.status
                    },
                    {headers: {'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token}}
                ).then(function (response) {
                    console.log(response.data);
                    $scope.transcript = response.data;
                    $scope.submit.isLoading = false;
                    $scope.submit.form.isEnded = false;
                    $scope.submit.form.comment = "";

                    if(action === 'load-read' || $scope.transcript.status === "validation") {
                        $scope.page.status = 'read';
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
            $scope.admin.status.isLoading = true;
            $http.patch('http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/transcripts/'+$scope.transcript.id,
                {
                    "updateComment": "Edit status to "+$scope.admin.status.value,
                    "status": $scope.admin.status.value
                },
                {headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
            ).then(function (response) {
                console.log(response.data);
                $scope.transcript = response.data;
                $scope.admin.status.isLoading = false;
                $scope.page.status = 'read';
            });
        };

        /**
         * Validation accept management
         */
        $scope.admin.validation.accept.load = function() {
            $scope.admin.validation.accept.isLoading = true;
            $http.patch('http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/transcripts/'+$scope.transcript.id,
                {
                    "content": $scope.wysiwyg.area,
                    "updateComment": "Accept validation",
                    "status": "validated"
                },
                {headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
            ).then(function (response) {
                console.log(response.data);
                $scope.transcript = response.data;
                $scope.admin.validation.accept.isLoading = false;
                $scope.page.status = 'read';
            });
        };

        /**
         * Validation refuse management
         */
        $scope.admin.validation.refuse.load = function() {
            $scope.admin.validation.refuse.isLoading = true;
            $http.patch('http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/transcripts/'+$scope.transcript.id,
                {
                    "content": $scope.wysiwyg.area,
                    "updateComment": "Refuse validation",
                    "status": "transcription"
                },
                {headers:  {'Authorization': $rootScope.oauth.token_type+" "+$rootScope.oauth.access_token}}
            ).then(function (response) {
                console.log(response.data);
                $scope.transcript = response.data;
                $scope.admin.validation.refuse.isLoading = false;
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