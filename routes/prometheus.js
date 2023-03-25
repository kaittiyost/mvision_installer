const express = require('express');
const PrometheusController = require('../controllers/prometheusController');
const router = express.Router();

router.get('/', PrometheusController.promeConfigPage)

router.post('/addJob',PrometheusController.promeAddJob)
router.post('/delJob', PrometheusController.promeDelJob)

module.exports = router;