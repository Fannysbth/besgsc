// controllers/tableController.js
const SensorData = require("../models/SensorData");

// Fungsi umum ambil data berdasarkan topic & filter optional
const fetchTableData = async (topic, limit = 50) => {
  return await SensorData.find({ topic })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// === Controller untuk masing-masing tabel ===
exports.getSensorTable = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const data = await fetchTableData("esp32/sensors", limit);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load sensor table", error: err.message });
  }
};

exports.getAudioTable = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const data = await fetchTableData("esp32/audio", limit);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load audio table", error: err.message });
  }
};

exports.getJetsonTable = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const data = await fetchTableData("jetson", limit);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load jetson table", error: err.message });
  }
};
