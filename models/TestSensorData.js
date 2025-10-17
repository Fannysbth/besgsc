const mongoose = require('mongoose');

const TestSensorDataSchema = new mongoose.Schema({
  sensorId: { type: String, required: true },
  sensorType: { type: String, default: "test" }, // bisa diisi bebas
  temperature: { type: Number },
  humidity: { type: Number },
  timestamp: { type: Date, default: Date.now },
  rawMessage: { type: String } // simpan payload asli
}, { strict: false }); // strict: false supaya field baru bisa masuk tanpa error

module.exports = mongoose.model('TestSensorData', TestSensorDataSchema);
