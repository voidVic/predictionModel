const bjc = require('natural-brain');
const data = require('./mlData.json');

let eventClassifier = new bjc();
let targetClassifier = new bjc();
let classifier = new bjc();
let colorClassifier = new bjc();

let trainData = () =>{
    //hardcoded classifiers
    
    classifier.addDocument('write i am ankit in box 2', 'i am ankit');
    classifier.addDocument('write boy is abd in box 6', 'boy is abd');
    classifier.addDocument('make i am ankit in box 2', 'i am ankit');
    classifier.addDocument(["123", "abc"], 'boy is abd');

    classifier.train();

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
    const text = req.body.what;

    let classification = {};
    classification.event = eventClassifier.classify(text);
    classification.target = targetClassifier.classify(text);
    //classification.classify = classifier.classify(text);
    if(classification.event === "color"){
        classification.hasColor = true;
        classification.color = colorClassifier.classify(text);
    }
    if(classification.event === "text"){
        classification.hasText = true;
        classification.text = extractText(text);
    }

    res.send(classification);
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

trainData();

module.exports.classifyText = classifyText;