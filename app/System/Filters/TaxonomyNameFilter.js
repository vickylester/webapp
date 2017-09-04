'use strict';

angular.module('transcript.filter.taxonomyName', ['ui.router'])

    .filter('taxonomyName', [function() {
        return function (taxonomyId) {
            let taxonomyName = "";
            switch(taxonomyId) {
                case "testators":
                    taxonomyName = "testateur";
                    break;
                case "places":
                    taxonomyName = "lieu";
                    break;
                case "regiments":
                    taxonomyName = "régiment";
                    break;
                default:
                    taxonomyName = "Inconnu";
            }
            return taxonomyName;
        }
    }])

;