'use strict';

angular.module('transcript.filter.willNumberFormat', ['ui.router'])

    .filter('willNumberFormat', [function() {
        return function (number) {
            let str = number.toString();
            if(str.length === 1) {
                return "000"+str;
            } else if(str.length === 2) {
                return "00"+str;
            } else if(str.length === 3) {
                return "0"+str;
            } else {
                return str;
            }
        }
    }])

;