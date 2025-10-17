// routes/tableRoutes.js
const express = require("express");
const router = express.Router();
const {
  getSensorTable,
  getAudioTable,
  getJetsonTable
} = require("../controllers/tableController");

// Tabel untuk histori data
router.get("/sensors", getSensorTable);
router.get("/audio", getAudioTable);
router.get("/jetson", getJetsonTable);

module.exports = router;
