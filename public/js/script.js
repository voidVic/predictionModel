'use strict';

var app = angular.module('piccolo', []);

// app.config(['$routeProvider', function ($routeProvider) {
//   $routeProvider
//     // Home
//     //.when("/", {templateUrl: "partials/home.html", controller: "homeController as homeCtrl"})
//     // Pages
//     // else 404
//     //.otherwise("/404", {templateUrl: "partials/404.html"});
// }]);

app.factory('appService', ['$http', function ($http) {
    var appFactory = {};
    appFactory.sendCommand = function (text, cbs, cbe) {
        $http({
            url: "classify/text",
            method: "POST",
            data: {'what': text},
            json: true
        })
            .then(function (data) {
                console.log(data);
                if (data.err) {
                    return cbe();
                }
                return cbs(data);
            });
    }

    return appFactory;
}]);

app.controller('mainController', ['appService', function (appService) {
    var ctrl = this;
    var recognition;
    var lastCommand = "";
    var freshCommand = true;
    var init = function () {
        ctrl.error = "";
        initSpeechLong();
        initSpeechShort();
        recognition.start();
        recognition.onresult = function(event){
             var speech = event.results[event.resultIndex][0].transcript;
            if(haveWakeWord(speech)){
            }
            freshCommand = false;
            console.log("starting short");
            recognitionShort.start();
        }
        recognitionShort.onresult = function (event) {
            //console.log(event);
            var speech = event.results[event.resultIndex][0].transcript;
            console.log(speech);
            appService.sendCommand(speech, function(data){
                        console.log(data);
                    }, function(err){
                        console.log(err);
                    })
            // if(haveWakeWord(speech)){
            //     if(lastCommand == speech){
            //         ctrl.command = speech;
            //         appService.sendCommand(speech, function(data){
            //             console.log(data);
            //         }, function(err){
            //             console.log(err);
            //         })
            //     }
            //     lastCommand = speech;
            // }
        };
        recognition.onend = function () {
            if(freshCommand){
                console.log("restarted");
                lastCommand = "";
                recognition.start();
            }
        };
        recognitionShort.onend = function(){
            freshCommand = true;
            console.log("starting long again");
            recognition.start();
        }
    }
    var recognition, recognitionShort;
    var actionSpeech = "";
    var initSpeechLong = function () {

        if (!('webkitSpeechRecognition' in window)) {
            //Speech API not supported here…
            ctrl.error = "Bro ure missing something, Speech not recognized";
        } else { //Let’s do some cool stuff :)
            recognition = new webkitSpeechRecognition(); //That is the object that will manage our whole recognition process. 
            recognition.continuous = true;   //Suitable for dictation. 
            recognition.interimResults = true;  //If we want to start receiving results even if they are not final.
            //Define some more additional parameters for the recognition:
            recognition.lang = "en-US";
            recognition.maxAlternatives = 1; //Since from our experience, the highest result is really the best...

        }
    }

    var initSpeechShort = function () {

        if (!('webkitSpeechRecognition' in window)) {
            //Speech API not supported here…
            ctrl.error = "Bro ure missing something, Speech not recognized";
        } else { //Let’s do some cool stuff :)
            recognitionShort = new webkitSpeechRecognition(); //That is the object that will manage our whole recognition process. 
            recognitionShort.continuous = false;   //Suitable for dictation. 
            recognitionShort.interimResults = false;  //If we want to start receiving results even if they are not final.
            //Define some more additional parameters for the recognition:
            recognitionShort.lang = "en-US";
            recognitionShort.maxAlternatives = 1; //Since from our experience, the highest result is really the best...

        }
    }
    
    var haveWakeWord = function(text){
        return true;
        if(text.indexOf('piccolo') >= 0){
            return true;
        }
        return false;
    }



    init();

}]);

(function () {
    console.log("hello world");
})();