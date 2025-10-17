// routes/chartRoutes.js
const express = require("express");
const router = express.Router();
const {
  getSensorChart,
  getAudioChart,
  getJetsonChart,
} = require("../controllers/chartController");

router.get("/sensors", getSensorChart);
router.get("/audio", getAudioChart);
router.get("/jetson", getJetsonChart);

module.exports = router;
