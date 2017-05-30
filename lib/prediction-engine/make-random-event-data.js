var fs = require('fs');

var colorIP = "0123456789ABCDEF";
var file = __dirname + '/event-data.json';

var DataModel = function(){
    this.time;
    this.color = "#";
}

var createData = function(howMany, cb){
    var trainingData = '[\n';
    var minTime = 0;
    var maxTime = 2399;
    for(var i = 0 ; i < howMany ; i++){
        var data = new DataModel();
        data.time = getRandomIn(minTime, maxTime);

        for(var j = 0 ; j < 6 ; j++){
            data.color += colorIP[getRandomIn(0, 16)];
        }
        trainingData += '\t'
        trainingData += JSON.stringify(data);
        if(i != howMany-1)
            trainingData += ',\n';
    }
    trainingData += '\n]'
    cb(trainingData);
}

var getRandomIn = function(min, max){
    return Math.floor( Math.random()*(max - min) ) + min;
}

var createRandomData = function(req, res){
    try{
        var howMany = req.body['how-many'];
    }catch(ex){
        console.error("exception occured in taking how-many data from body. Error Below \n\nException: ", ex);
        return res.send(ex);
    }
    createData(howMany, function(data){
        writeDataToFile(data);
        res.send("Check File or Look for exception :) ");
    });
}

var writeDataToFile = function(data){
    var exist = fs.existsSync(file);
     if(exist){
        try{
            //var stringData = JSON.stringify(data);
        }catch(ex){
            console.error("exception occured in Stringifying data to write to file. Error Below \n\nException: ", ex);
        }
        try{
            fs.writeFile(file, data);
        }catch(ex){
            console.error("exception occured while writing data to file. Error Below \n\nException: ", ex);
        }
        console.log("Data written and created Successfully");
    }else{
        console.log("Data cannot be written, File not found");
    }
}

module.exports.createRandomData = createRandomData;