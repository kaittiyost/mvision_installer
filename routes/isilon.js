const express = require('express');
const isilonController = require('../controllers/isilonController');
const router = express.Router();

router.get('/', isilonController.isilonConfigPage)

module.exports = router;