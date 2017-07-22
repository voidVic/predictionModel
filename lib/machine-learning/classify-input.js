const bjc = require('natural-brain');
const data = require('./mlData.json');
const natural = require('natural');
const path = require("path");

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

let trainData = () =>{
    //hardcoded classifiers
    
    // classifier.addDocument('write i am ankit in box 2', 'i am ankit');
    // classifier.addDocument('write boy is abd in box 6', 'boy is abd');
    // classifier.addDocument('make i am ankit in box 2', 'i am ankit');
    // classifier.addDocument(["123", "abc"], 'boy is abd');

    //classifier.train();

    const eventDataLength = data.event.length;
    for(let i = 0; i < eventDataLength; i++){
        eventClassifier.addDocument(data.event[i].q, data.event[i].a);
    }
    eventClassifier.train();

    
    const targetDataLength = data.target.length;
    for(let i = 0; i < targetDataLength; i++){
        targetClassifier.addDocument(data.target[i].q, data.target[i].a);
    }
    targetClassifier.train();

    
    const colorDataLength = data.color.length;
    for(let i = 0; i < colorDataLength; i++){
        colorClassifier.addDocument(data.color[i].q, data.color[i].a);
    }
    colorClassifier.train();
}


let classifyText = function(req, res){
    var text = req.body.what;
    var tokenText = tokenizer.tokenize(text);
    var taggedTokens = tagger.tag(tokenText);
    var grammerObj = getGrammers(taggedTokens);
    if(isRule(text)){
        res.send("Consider it done");
        return;
    }

    stemmedArr = isIfElse(text);
    if(text === false){
        res.send('false');
        return;
    }

    let classification = {};
    classification.event = eventClassifier.classify(text);
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
    let classifiedTxt = getClassificationOnevent(text, classification.event);

    res.send(classifiedTxt);
}

let getGrammers = (tokenArr) => {
    let grammerObj = {};//{ "NN": [], "VB": [], "IN": [] }
    let arrLen = tokenArr.length;
    while(--arrLen > -1){
        if(grammerObj[tokenArr[arrLen][1]] == undefined){
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
    
    for(let i=0; i<textToTokenizer.length; i++){
        let sentenceArr = text.split(textToTokenizer[i]);
        if(sentenceArr[0] !== text){
            sentence = sentenceArr[1];
            return sentence;
        }
    }

    //check sentence for type "write/put/make [sentence] in/on/inside [place]"
    const preBreak = ["write", "put", "make"];
    const postBreak = ["in", "on", "inside"];
    for(let i=0; i<preBreak.length; i++){
        let sentenceArr = text.split(preBreak[i]);
        if(sentenceArr[0] !== text){
            sentence = sentenceArr[1];
            break;
        }
    }
    
    if(sentence !== ""){
        for(let i=0; i<postBreak.length; i++){
            let sentenceArr = sentence.split(postBreak[i]);
            if(sentenceArr[0] !== sentence){
                sentence = sentenceArr[0];
                break;
            }
        }
        return sentence;
    }

    return "cannot understand the text to change";

}

var getClassificationOnevent = function(text, event){
    switch(event){
        case 'dim': {
            let light = whichLight(text);
            return " dimming your " + light;
        }break;
        case 'high': {
            let light = whichLight(text);
            return " increasing your " + light;
        }break;
        case 'on': {
            let light = whichLight(text);
            return " turning on your " + light;
        }break;
        case 'off': {
            let light = whichLight(text);
            return " turning off your " + light;
        }break;
        default : {
            return (classification.result="poo poo");
        }
    }
};

var whichLight = function(text){
    //get Lights from user accounts.
    const lightNames = ["my hall light", "kitchen bulb", "bedroom light"];
    let max = 0;
    let who = null;
    for(let i = 0 ; i < lightNames.length ; i++ ){
        let distance = natural.DiceCoefficient(text, lightNames[i]);
        if(distance > max && distance > 0.3){
            max = distance;
            who = i;
        }
    }

    return lightNames[who];

}

var isRule = function(text){
    return false;
}

var isIfElse = function(text){
    return text;
}

 trainData();
// console.log(natural.DiceCoefficient("I guess the hall bulb is glowing too bright","my hall bulb"));
// console.log(natural.DiceCoefficient("I guess the hall bulb is glowing too bright","my kitchen bulb"));
// console.log(natural.DiceCoefficient("I guess the hall bulb is glowing too bright","my bedroom bulb"));

module.exports.classifyText = classifyText;