const express = require('express');
const DockerController = require('../controllers/dockerController');
const router = express.Router();

router.get('/DockerPS', DockerController.dockerPS)

module.exports = router;