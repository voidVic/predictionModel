const bjc = require('natural-brain');
const data = require('./mlData.json');
const natural = require('natural');
const path = require("path");
const lightApi = require('../api/light-api');

var tokenizer = new natural.WordTokenizer();

var base_folder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
var rulesFilename = base_folder + "/data/English/tr_from_posjs.txt";
var lexiconFilename = base_folder + "/data/English/lexicon_from_posjs.json";
var defaultCategory = 'N';

var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);

let eventClassifier = new bjc();
let targetClassifier = new bjc();
//let classifier = new bjc();
let colorClassifier = new bjc();

const colorArr = [
    { color: 'red', code: 'ff6666' },
    { color: 'green', code: '66ff66' },
    { color: 'blue', code: '6666ff' },
    { color: 'white', code: 'bbbbbb' },
    { color: 'pink', code: '885EAD' },
];

let trainData = () => {
    //hardcoded classifiers

    // classifier.addDocument('write i am ankit in box 2', 'i am ankit');
    // classifier.addDocument('write boy is abd in box 6', 'boy is abd');
    // classifier.addDocument('make i am ankit in box 2', 'i am ankit');
    // classifier.addDocument(["123", "abc"], 'boy is abd');

    //classifier.train();

    const eventDataLength = data.event.length;
    for (let i = 0; i < eventDataLength; i++) {
        eventClassifier.addDocument(data.event[i].q, data.event[i].a);
    }
    eventClassifier.train();


    const targetDataLength = data.target.length;
    for (let i = 0; i < targetDataLength; i++) {
        targetClassifier.addDocument(data.target[i].q, data.target[i].a);
    }
    targetClassifier.train();


    const colorDataLength = data.color.length;
    for (let i = 0; i < colorDataLength; i++) {
        colorClassifier.addDocument(data.color[i].q, data.color[i].a);
    }
    colorClassifier.train();
}


let classifyText = function (req, res) {
    let classification = {};
    classification.text = req.body.what;
    classification.tokenText = tokenizer.tokenize(classification.text);
    classification.taggedTokens = tagger.tag(classification.tokenText);
    classification.grammerObj = getGrammers(classification.taggedTokens);
    if (isRule(classification)) {
        res.send("Consider it done");
        return;
    }

    classification = isIfElse(classification);
    if (classification.text === false) {
        res.send('false');
        return;
    }

    classification.event = eventClassifier.classify(classification.text);
    //classification.target = targetClassifier.classify(text);
    //classification.classify = classifier.classify(text);
    // if(classification.event === "color"){
    //     classification.hasColor = true;
    //     classification.color = colorClassifier.classify(text);
    // }
    // if(classification.event === "text"){
    //     classification.hasText = true;
    //     classification.text = extractText(text);
    //}
    let classifiedTxt = getClassificationOnevent(classification);

    res.send(classifiedTxt);
}

let getGrammers = (tokenArr) => {
    let grammerObj = {};//{ "NN": [], "VB": [], "IN": [] }
    let arrLen = tokenArr.length;
    while (--arrLen > -1) {
        if (grammerObj[tokenArr[arrLen][1]] == undefined) {
            grammerObj[tokenArr[arrLen][1]] = [];
        }
        grammerObj[tokenArr[arrLen][1]].push(tokenArr[arrLen][0]);
    }
    return grammerObj;
}

let extractText = (text) => {

    let sentence = "";


    //check sentense for type "change/make text to [sentence]"

    const textToTokenizer = ["text to", "text too", "text two", "text 2"];

    for (let i = 0; i < textToTokenizer.length; i++) {
        let sentenceArr = text.split(textToTokenizer[i]);
        if (sentenceArr[0] !== text) {
            sentence = sentenceArr[1];
            return sentence;
        }
    }

    //check sentence for type "write/put/make [sentence] in/on/inside [place]"
    const preBreak = ["write", "put", "make"];
    const postBreak = ["in", "on", "inside"];
    for (let i = 0; i < preBreak.length; i++) {
        let sentenceArr = text.split(preBreak[i]);
        if (sentenceArr[0] !== text) {
            sentence = sentenceArr[1];
            break;
        }
    }

    if (sentence !== "") {
        for (let i = 0; i < postBreak.length; i++) {
            let sentenceArr = sentence.split(postBreak[i]);
            if (sentenceArr[0] !== sentence) {
                sentence = sentenceArr[0];
                break;
            }
        }
        return sentence;
    }

    return "cannot understand the text to change";

}

var getClassificationOnevent = function (classification) {
    const light = whichLight(classification.text);
    if(light == undefined){
        return "Oops!! no such light bulb found";
    }
    var colorObj = colorChangeCommand(classification.grammerObj);
    if(colorObj){
        lightApi.changeColor(light, colorObj.code);
        return " changing your " + light + " color to " + colorObj.color;
    }
    switch (classification.event) {
        case 'dim': {
            //let light = whichLight(classification.text);
            lightApi.dim(light);
            return " dimming your " + light;
        } break;
        case 'high': {
            //let light = whichLight(classification.text);
            lightApi.high(light);
            return " increasing your " + light;
        } break;
        case 'on': {
            //let light = whichLight(classification.text);
            lightApi.turnOn(light);
            return " turning on your " + light;
        } break;
        case 'off': {
            //let light = whichLight(classification.text);
            lightApi.turnOff(light);
            return " turning off your " + light;
        } break;
        default: {
            return (classification.result = "I couldn't understand what do you mean by " + classification.text);
        }
    }
};

var colorChangeCommand = function (grammerObj) {
    var colorObj = false;
    if(grammerObj.JJ == undefined){
        return false;
    }
    var jjLen = grammerObj.JJ.length;
    for (let i = 0; i < jjLen; i++) {
        for (let j = 0; j < colorArr.length; j++) {
            if (grammerObj.JJ[i] == colorArr[j].color) {
                colorObj = colorArr[j];
                return colorObj;
            }
        }
    }
    return colorObj;
}

var whichLight = function (text) {
    //get Lights from user accounts.
    const lightNames = ["my hall light", "kitchen bulb", "bedroom light"];
    let max = 0;
    let who = null;
    for (let i = 0; i < lightNames.length; i++) {
        let distance = natural.DiceCoefficient(text, lightNames[i]);
        if (distance > max && distance > 0.3) {
            max = distance;
            who = i;
        }
    }

    return lightNames[who];

}

var isRule = function (text) {
    return false;
}

var isIfElse = function (text) {
    return text;
}

trainData();

module.exports.classifyText = classifyText;