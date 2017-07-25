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
            }
        };
    })

    .controller('AppTranscriptCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'transcript', 'resource', 'ContentService', function($rootScope, $scope, $http, $sce, $state, transcript, resource, ContentService) {
        /* Variables definition */
        /*function loadViewer(id) {
            return new Viewer(document.getElementById(id), {inline: true, button: true, tooltip: false, title:false, scalable: false});
        }*/
        var config = YAML.load('App/Transcript/toolbar.yml');
        var user_role_transcript;

        if($rootScope.user !== undefined) {
            if ($.inArray("ROLE_SUPER_ADMIN", $rootScope.user.roles) > -1 && $.inArray("ROLE_ADMIN", $rootScope.user.roles) > -1 && $.inArray("ROLE_MODO", $rootScope.user.roles) > -1) {
                user_role_transcript = "validator";
            } else {
                user_role_transcript = "editor";
            }
            $rootScope.user.transcript = {
                role: user_role_transcript
            };
            console.log($rootScope.user.transcript);
            $scope.readOnly = false;
        } else {
            $scope.readOnly = true;
        }
        $scope.page = {
            loading: true,
            status: "read"
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

        console.log(transcript);
        $scope.transcript = transcript;
        $scope.resource = resource;
        $scope.page.loading = false;

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
            var tag = config.tei[tagName],
                tagInsert = "",
                defaultAddChar = 2;

            if(tag.xml.unique === "true") {
                tagInsert = "<"+tag.xml.name+" />";
                defaultAddChar = 4;
            } else if(tag.xml.unique === "false") {
                tagInsert = "<" + tag.xml.name + ">"+$scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange())+"</" + tag.xml.name + ">";
            }


            //console.log($scope.aceEditor.getCursorPosition());
            var lineNumber = $scope.aceEditor.getCursorPosition().row,
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
            var attribute = config.tei[attributeName],
                defaultAddChar = 8;

            var attrInsert = "<hi " + attribute.xml.name + "=\"" + attribute.xml.value + "\">" + $scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange()) + "</hi>";

            var lineNumber = $scope.aceEditor.getCursorPosition().row,
                column = $scope.aceEditor.getCursorPosition().column+attribute.xml.name.length+attribute.xml.value.length+defaultAddChar;
            $scope.aceEditor.insert(attrInsert);
            $scope.aceEditor.getSelection().moveCursorTo(lineNumber, column);
            $scope.aceEditor.focus();
        };

        /**
         * This function watches #live.content, encodes it and displays it
         */
        $scope.$watch('wysiwyg.area', function() {
            var encodeLiveRender = $scope.wysiwyg.area;
            for(var buttonId in config.tei) {
                encodeLiveRender = encodeHTML(encodeLiveRender, config.tei[buttonId]);
            }
            $scope.wysiwyg.live.content = $sce.trustAsHtml(encodeLiveRender);
        });

        /**
         * Encode the transcription in HTML
         *
         * @param encodeLiveRender
         * @param button
         * @returns {*}
         */
        function encodeHTML(encodeLiveRender, button) {
            var regex = "",
                html = "";

            if(button.type === "tag") {
                var attributesHtml = "";
                if(button.html.attributes !== undefined) {
                    for(var attribute in button.html.attributes) {
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
        }

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

        // -------------------- Modal management

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

            $scope.wysiwyg.modal.content = $scope.loadFile("modal-"+id_modal);
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

        /**
         * This function loads files for twig and angularJS
         * @param file
         * @returns {string|*}
         */
        $scope.loadFile = function(file) {
            return 'App/Transcript/tpl/'+file+'.html';
        };

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

        $scope.loadViewer = function(id) {
            return new Viewer(document.getElementById(id), {inline: true, button: true, tooltip: false, title:false, scalable: false});
        };

        //--------------- Submit

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
                $scope.modal('goBack');
            }
        };

        /**
         * Safe go back management
         */
        $scope.submit.safeGoBack = function() {
            $scope.wysiwyg.area = $scope.transcript.content;
            $scope.page.status = 'read';
        };

        //------------- Administration:
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

    }])
;