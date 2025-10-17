const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: false,
    minlength: 6
  },
  profilePic: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  subscribedAlerts: [{
    sensorType: String,
    sensorId: String,
    threshold: mongoose.Schema.Types.Mixed,
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  alertPreferences: {
    whatsapp: { type: Boolean, default: true },
    cooldownMinutes: { type: Number, default: 5 },
    workingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' }
    }
  },
  lastAlertSent: Date,
  googleId: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

// Hash password sebelum save & set default subscribedAlerts
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

  // Default subscribedAlerts untuk semua sensor
  if (!this.subscribedAlerts || this.subscribedAlerts.length === 0) {
    this.subscribedAlerts = [
      { sensorType: 'temperature', sensorId: 'all', threshold: 35, enabled: true },
      { sensorType: 'sound', sensorId: 'all', threshold: 85, enabled: true },
      { sensorType: 'camera', sensorId: 'all', enabled: true }
      // bisa ditambah sensor lain kalau ada
    ];
  }

  next();
});

// Method cek password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
