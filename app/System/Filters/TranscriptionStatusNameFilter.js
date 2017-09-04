'use strict';

angular.module('transcript.filter.transcriptionStatusName', ['ui.router'])

    .filter('transcriptionStatusName', [function() {
        return function (transcriptionStatusID) {
            let transcriptionStatusName = "";
            switch(transcriptionStatusID) {
                case "todo":
                    transcriptionStatusName = "À faire";
                    break;
                case "transcription":
                    transcriptionStatusName = "En cours";
                    break;
                case "validation":
                    transcriptionStatusName = "En validation";
                    break;
                case "validated":
                    transcriptionStatusName = "Validé";
                    break;
                default:
                    transcriptionStatusName = "Inconnu";
            }
            return transcriptionStatusName;
        }
    }])

;