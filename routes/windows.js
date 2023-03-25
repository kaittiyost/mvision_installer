const express = require('express');
const WindowsController = require('../controllers/windowsController');
const router = express.Router();

router.get('/', WindowsController.windowsConfigPage)
router.get('/get', WindowsController.windowsGetHost)
router.post('/add', WindowsController.windowsAddHost)
router.post('/del', WindowsController.windowsDelHost)

module.exports = router;