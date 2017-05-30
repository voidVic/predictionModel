const express = require('express');
const lib = require('../lib');
const router = express.Router();

router.post('/predict/onTime',
            lib.predict.onTime);

router.post('/classify/text',
            lib.ml.classifyText);

router.post('/create-data/training',
            lib.createData.createRandomData);

module.exports = router;