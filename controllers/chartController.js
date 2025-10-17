// controllers/chartController.js
const SensorData = require("../models/SensorData");

// Ambil history sensor (THI, suhu, kelembaban)
exports.getSensorChart = async (req, res) => {
  try {
    const data = await SensorData.find({ topic: "esp32/sensors" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sensor chart data",
      error: err.message,
    });
  }
};

// Ambil history audio (db_level)
exports.getAudioChart = async (req, res) => {
  try {
    const data = await SensorData.find({ topic: "esp32/audio" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audio chart data",
      error: err.message,
    });
  }
};

// Ambil history posture Jetson
exports.getJetsonChart = async (req, res) => {
  try {
    const data = await SensorData.find({ topic: "jetson" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jetson chart data",
      error: err.message,
    });
  }
};
