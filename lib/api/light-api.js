var request = require('request');

module.exports = {
    changeColor: (device, color, classification, cb) => {
        if (!classification.isCheckCommand) {
            url = "http://localhost:4030/connect/account/20394B8B923F4907AFA1FDE51CACFD62/philips/device/" + device.id + "/action/setColor";
            var options = {
                url: url,
                json: true,
                body: { value: color }
            }
            request.put(options, function (err, resp) {
                console.log(err, resp);
            })
            cb(true);
        } else {
            url = "http://localhost:4030/connect/account/20394B8B923F4907AFA1FDE51CACFD62/philips/device/" + device.id;
            var options = {
                url: url,
                json: true
            }
            request.get(options, function (err, resp) {
                console.log(err, resp);
            })
        }
    },


    turnOn: (device, classification, cb) => {
        if (!classification.isCheckCommand) {
            url = "http://localhost:4030/connect/account/20394B8B923F4907AFA1FDE51CACFD62/philips/device/" + device.id + "/action/setSwitch";
            var options = {
                url: url,
                json: true,
                body: { value: "ON" }
            }
            request.put(options, function (err, resp) {
                console.log(err, resp);
            })
            cb(true);
        } else {
            url = "http://localhost:4030/connect/account/20394B8B923F4907AFA1FDE51CACFD62/philips/device/" + device.id;
            var options = {
                url: url
            }
            request.get(options, function (err, resp, body) {
                if (err) {
                    cb(false);
                }
                if (typeof (body) == 'string') {
                    try {
                        body = JSON.parse(body);
                    } catch (ex) {
                        cb(false);
                    }
                }
                //var body = resp.body;
                try {
                    var capabilities = body._embedded['iot:capabilities'];
                    for (let i = 0; i < capabilities.length; i++) {
                        if (capabilities[i].name == 'switch') {
                            if (capabilities[i]._embedded['iot:states'][0].value == 'ON') {
                                return cb(true);
                            }
                        }
                    }
                } catch (ex) {
                }
                cb(false);
            })
        }
    },


    turnOff: (device, classification, cb) => {
        if (!classification.isCheckCommand) {
            url = "http://localhost:4030/connect/account/20394B8B923F4907AFA1FDE51CACFD62/philips/device/" + device.id + "/action/setSwitch";
            var options = {
                url: url,
                json: true,
                body: { value: "OFF" }
            }
            request.put(options, function (err, resp) {
                console.log(err, resp);
            })
            cb(true);
        } else {
            url = "http://localhost:4030/connect/account/20394B8B923F4907AFA1FDE51CACFD62/philips/device/" + device.id;
            var options = {
                url: url
            }
            request.get(options, function (err, respbody) {
                if (err) {
                    cb(false);
                }
                if (typeof (body) == 'string') {
                    try {
                        body = JSON.parse(body);
                    } catch (ex) {
                        cb(false);
                    }
                }
                var body = resp.body;
                var capabilities = body._embedded['iot:capabilities'];
                for (let i = 0; i < capabilities.length; i++) {
                    if (capabilities.name == 'switch') {
                        if (capabilities._embedded['iot:states'].value == 'OFF') {
                            return cb(true);
                        }
                    }
                }
                cb(false);
            })
        }
    },
    dim: (deviceName, classification, cb) => {

        if (!classification.isCheckCommand) {
            return true;
        }
    },
    high: (deviceName, classification, cb) => {

        if (!classification.isCheckCommand) {
            return true;
        }
    }
};