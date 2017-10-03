'use strict';

angular.module('transcript.filter.taxonomyName', ['ui.router'])

    .filter('taxonomyName', [function() {
        return function (taxonomyId, qualification) {
            let taxonomyName = "";
            switch(taxonomyId) {
                case "testators":
                    if(qualification === "plural") {
                        taxonomyName = "testateurs";
                    } else {
                        taxonomyName = "testateur";
                    }
                    break;
                case "places":
                    if(qualification === "plural") {
                        taxonomyName = "lieux";
                    } else {
                        taxonomyName = "lieu";
                    }
                    break;
                case "military-units":
                    if(qualification === "plural") {
                        taxonomyName = "unités militaires";
                    } else {
                        taxonomyName = "unité militaire";
                    }
                    break;
                default:
                    taxonomyName = "Inconnu";
            }
            return taxonomyName;
        }
    }])

;