'use strict';

angular.module('transcript.filter.organisationName', ['ui.router'])

    .filter('organisationName', [function() {
        return function (organisationAbbr) {
            let organisationName = "";
            switch(organisationAbbr) {
                case "AN":
                    organisationName = "Archives nationales";
                    break;
                case "AD78":
                    organisationName = "Archives départementales des Yvelines";
                    break;
                default:
                    organisationName = "Organisation inconnue";
            }
            return organisationName;
        }
    }])

;