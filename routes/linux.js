const express = require("express");
const LinuxController = require("../controllers/linuxController");
const router = express.Router();


router.get("/", LinuxController.linuxConfigPage);
router.get("/get", LinuxController.linuxGetHost);
router.post("/add", LinuxController.linuxAddHost);
router.post("/del", LinuxController.linuxDelHost);


module.exports = router;
