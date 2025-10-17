const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  sensorType: {
    type: String,
    required: true,
    enum: ['camera', 'temperature', 'humidity', 'sound', 'other']
  },
  sensorId: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  topic: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
sensorDataSchema.index({ sensorType: 1, sensorId: 1, timestamp: -1 });
sensorDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);