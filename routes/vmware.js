const express = require('express');
const vmwareController = require('../controllers/vmwareController');
const router = express.Router();

router.get('/', vmwareController.vmwareConfigPage)
router.get('/get', vmwareController.vmwareGetHost)
router.post('/add',vmwareController.vmwareAddHost)
router.post('/del',vmwareController.vmwareDelHost)

module.exports = router;