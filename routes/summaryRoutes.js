// routes/summaryRoutes.js
const express = require("express");
const router = express.Router();
const { getLatestSummary } = require("../controllers/summaryController");

router.get("/latest", getLatestSummary);

module.exports = router;
