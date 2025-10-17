// controllers/summaryController.js
const SensorData = require("../models/SensorData");

exports.getLatestSummary = async (req, res) => {
  try {
    const latestTHI = await SensorData.findOne({ topic: "esp32/sensors" })
      .sort({ createdAt: -1 })
      .lean();

    const latestSound = await SensorData.findOne({ topic: "esp32/audio" })
      .sort({ createdAt: -1 })
      .lean();

    const latestJetson = await SensorData.findOne({ topic: "jetson" })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: {
        sensors: latestTHI || null,
        audio: latestSound || null,
        jetson: latestJetson || null
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch summary data",
      error: err.message
    });
  }
};
