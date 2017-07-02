const eventData = require('./event-data.json');

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

};

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