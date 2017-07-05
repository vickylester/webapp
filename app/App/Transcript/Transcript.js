'use strict';

angular.module('transcript.app.transcript', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.transcript', {
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    templateUrl: 'App/Transcript/Transcript.html',
                    controller: 'AppTranscriptCtrl'
                }
            },
            url: '/transcript/{id}',
            resolve: {
                transcript: function(TranscriptService, $transition$) {
                    return TranscriptService.getTranscript($transition$.params().id);
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

    .controller('AppTranscriptCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'transcript', function($rootScope, $scope, $http, $sce, $state, transcript) {
        /* Variables definition */
        var viewer = new Viewer(document.getElementById('transcript-image'), {inline: true, button: true, tooltip: false, title:false, scalable: false});
        var config = YAML.load('App/Transcript/toolbar.yml');
        $scope.user = {
            status: "editor"
        };
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
            modal: ""
        };
        $scope.validation = {
            isLoading: false
        };
        //console.log(transcript);
        $scope.transcript = transcript;
        $scope.page.loading = false;
        /* Get item */
        /*$http.get(Routing.generate('app_transcript_loadTranscript', {"id_transcript": $scope.transcript.id})).then(function (response) {
            $scope.wysiwyg.area = response.data.content;
            $scope.transcript.status = response.data.status;
            $scope.page.loading = false;
        });*/

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
         * Modal management
         * @param id_modal
         */
        $scope.modal = function(id_modal) {
            $('#transcript-edit-modal').modal('hide');
            // Reset variables :
            if(id_modal === "choice-orig") {
                $scope.wysiwyg.choice_orig_modal_orig = "";
                $scope.wysiwyg.choice_orig_modal_reg = "";
                $scope.wysiwyg.choice_orig_modal_orig = $scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange());
            }

            $scope.wysiwyg.modal = $scope.loadFile("modal-"+id_modal);
            $('#transcript-edit-modal').modal('show');
            $(".modal-backdrop").appendTo("#transcript-edit");
            $("body").removeClass();
        };

        /**
         * Modal validation
         * @param id_validation
         */
        $scope.validModal = function(id_validation) {
            $('#choice-modal, #choice-abbr-modal, #choice-orig-modal, #choice-sic-modal').modal('hide');
            if(id_validation === "choice-orig-modal") {
                var orig_insertHTML = "",
                    reg_insertHTML = "";

                if($scope.choice_orig_modal_orig !== "") {orig_insertHTML = "<orig>"+$scope.choice_orig_modal_orig+"</orig>";}
                else {orig_insertHTML = "<orig />";}
                if($scope.choice_orig_modal_reg !== "") {reg_insertHTML = "<reg>"+$scope.choice_orig_modal_reg+"</reg>";}
                else {reg_insertHTML = "<reg />";}

                var insertXML = "<choice>"+orig_insertHTML+reg_insertHTML+"</choice>";
                $scope.wysiwyg.aceEditor.insert(insertXML);
            }
            $scope.wysiwyg.aceEditor.focus();
        };

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

        /**
         * This function loads files for twig and angularJS
         * @param file
         * @returns {string|*}
         */
        $scope.loadFile = function(file) {
            return 'App/Transcript/tpl/'+file+'.html'; //Routing.generate('app_transcript_loadTpl', {"label": file});
        };

        /**
         * Help management
         * @param file
         */
        $scope.help = function(file) {
            $scope.wysiwyg.interaction = $scope.loadFile('help-'+file);
            $scope.wysiwyg.live.status = false;
        };

        /**
         * Validation management
         */
        $scope.validation.load = function() {
            $scope.validation.isLoading = true;
            $http.patch('http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php/transcripts/'+$scope.transcript.id, {"content": $scope.wysiwyg.area}).then(function (response) {
                console.log(response.data);
                $scope.validation.isLoading = false;
            });
        };
    }])
;