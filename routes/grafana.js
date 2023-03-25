const express = require('express');
const grafanaController = require('../controllers/grafanaController');
const router = express.Router();

router.get('/', grafanaController.homePage)
router.get('/createDashboardPage', grafanaController.createDashboardPage)
router.get('/getDashboard',grafanaController.GetDashbaord)

module.exports = router;