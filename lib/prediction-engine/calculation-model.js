const predictedData = require('./predicted-data.json');

let onTime = (req, res) => {
    const time = req.body.time;
    const dayFrame = (time<600)?'morning':(time<1200)?'afternoon':(time>1800)?'evening':'night';
    let dayFrameData;
    for(let i = 0 ; i < predictedData.length ; i++ ){
        if(predictedData[i].dayframe == dayFrame){
            dayFrameData = predictedData[i].colorMatrix;
            break;
        }
    }

    //Pick data with highrst probability
    let prediction = new PredictionObject();
    for(let i = 0 ; i < dayFrameData.length; i++){
        if(dayFrameData[i].probability > prediction.cutOff){
            prediction.overCutoff.push(dayFrameData[i]);
            prediction.isOnly = true;
            break;
        }else{
            prediction.underCutoff.push(dayFrameData[i]);
        }
    }

    if(prediction.isOnly){
        return res.send(prediction.overCutoff);
    }
    
    prediction.underCutoff.sort((a, b)=>{
        return a.probability - b.probability
    });

    return res.send(prediction.underCutoff);
}

var PredictionObject = function(){
    this.isOnly = false;
    this.cutOff = 0.69;
    this.overCutoff = [];
    this.underCutoff = [];
}

module.exports.onTime = onTime;