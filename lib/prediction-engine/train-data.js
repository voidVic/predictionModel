const eventData = require('./event-data.json');
let predictedData = [];

module.exports.startTraining = startTraining;

var startTraining = (req, res) => {
    let dayObj = {
        start: 600,
        end: 2399,
        frames: 3
    };
    trainEventDataOnDayTime(dayObj, (err, done) => {
        if (err) {
            return res.send('Something is wrong, check train Event Data method');
        }
        if (done) {
            return res.send('Data Trained, Still Confirm it by looking the model file');
        }
    });
};

var trainEventDataOnDayTime = (dayObj, cb) => {
    let checkPoints = [dayObj.start];
    try {
        let breakPt = Math.round((dayObj.end - dayObj.start) / dayObj.frames);
    } catch (ex) {
        cb(ex, false);
    }
    for (let i = 0; i < dayObj.frames; i++) {
        checkPoints.push(breakPt + checkPoints[i]);
    }

    //sortEventDataOnTime();
    for ( let i = 0 ; i < eventData.length ; i++){
        for(let j = 1 ; j < checkPoints.length ; j++ ){
            if(eventData[i].time < checkPoints[j]){
                predictedData.data[j-1].push(eventData[i]);
                break;
            }
        }
    }
    var weights = [1, 1.2, 1.4, 1.6, 1.8];
    clubEventDataOnDays(5, weights);
};

var sortEventDataOnTime = () => {
    eventData.sort(function (a, b) {
        return (a.time > b.time) ? 1 : 0;
    });

}

/**
 * pass number of breakpoints on date in club.
 * pass array of integers in weights, with load equal to the club.
 * if no weight found, will be treated as 1 with an increment of 0.1 for subsequent club.
 * @param {*integer} club 
 * @param {*array} weights 
 */
var clubEventDataOnDays = (club, weights) => {
    weights = getProperWeights(weights);

}

var getProperWeights = (weights) => {
    if (typeof (weights) !== 'object') {
        weights = [];
    }
    if (weights.length < club) {
        let weightFactor = 0.1;
        let initWeight = (weights.length > 0) ? weights[weights.length] : 1;
        for (i = weights.length; i < club; i++) {
            weights.push(initWeight + weightFactor * (i + 1));
        }
    }
    return weights;
}

let PredictedModel = function () {
    this.dayframe = null, //should be an integer//"dayframe": "morning",
        this.dataMatrix = [ //was colorMAtrix
            {
                "color": "#009933",
                "probability": 0.7
            }, {
                "color": "#003399",
                "probability": 0.2
            }
        ]
}