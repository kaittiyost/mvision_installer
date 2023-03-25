const express = require('express');
const InfluxController = require('../controllers/influxController');
const router = express.Router();

router.get('/', InfluxController.influxConfigPage)

module.exports = router;