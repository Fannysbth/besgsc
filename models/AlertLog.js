const mongoose = require('mongoose');

const alertLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sensorType: {
    type: String,
    required: true
  },
  sensorId: {
    type: String,
    required: true
  },
  alertType: {
    type: String,
    required: true,
    enum: [
  'temperature_warning',
  'temperature_danger',
  'temperature_critical',
  'humidity_high',
  'sound_warning',
  'sound_urgent',
  'motion_detected',
  'camera_alert'
]

  },
  message: {
    type: String,
    required: true
  },
  sensorData: {
    type: mongoose.Schema.Types.Mixed
  },
  threshold: {
    type: mongoose.Schema.Types.Mixed
  },
  sentVia: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'cooldown'],
    default: 'sent'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AlertLog', alertLogSchema);