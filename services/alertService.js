const User = require('../models/User');
const WhatsAppService = require('./whatsappService');
const { calculateTHIStatus, calculateSoundStatus, calculatePostureStatus } = require('../utils/statusCalculator');

class AlertService {
  constructor() {
    this.alertRules = {
      temperature: { type: 'thi', field: 'temp' },
      humidity: { type: 'thi', field: 'humidity' },
      sound: { type: 'sound', field: 'db' },
      posture: { type: 'posture' },
      camera: { type: 'camera' },
    };
  }

  async processSensorData(sensorData) {
    console.log('🔥 ALERT SERVICE DITERIMA:', sensorData);
    const { sensorType, sensorId, data } = sensorData;
    const rule = this.alertRules[sensorType];
    if (!rule) return;

    try {
      // Ambil semua user yang WA-nya aktif dan ada telefon
      const users = await User.find({
        'alertPreferences.whatsapp': true,
        phone: { $exists: true, $ne: '' }
      });

      if (!users.length) {
        console.log("Tidak ada user dengan WA aktif.");
        return;
      }

      console.log("📌 User ditemukan untuk WA:", users.map(u => ({
      phone: u.phone,
      whatsappActive: u.alertPreferences.whatsapp
    })));

      for (const user of users) {
        if (this.shouldTriggerAlert(sensorType, data)) {
          await this.triggerAlert(user, sensorType, sensorId, data);
        }
      }
    } catch (error) {
      console.error('Error processing alert:', error);
    }
  }

  shouldTriggerAlert(sensorType, data) {
    switch (sensorType) {
      case 'temperature':
      case 'humidity': {
        const { thi_status } = calculateTHIStatus(data.temp, data.humidity || 50);
        return ['Siaga', 'Bahaya', 'Sangat Bahaya'].includes(thi_status);
      }
      case 'sound': {
        const soundStatus = calculateSoundStatus(data.db);
        return ['Waspada', 'Urgent'].includes(soundStatus);
      }
      case 'posture': {
        const { posture_status } = calculatePostureStatus(
          data.posture, data.total_time_seen_s, data.last_posture_since_s
        );
        return posture_status === 'Warning';
      }
      case 'camera':
        return true;
      default:
        return false;
    }
  }

  async triggerAlert(user, sensorType, sensorId, sensorData) {
    const message = WhatsAppService.formatAlertMessage(sensorType, { ...sensorData, sensorId });
    const alertData = {
      sensorType,
      sensorId,
      alertType: this.getAlertType(sensorType, sensorData),
      message,
      sensorData,
      threshold: null
    };

    await WhatsAppService.sendAlert(user, alertData);
  }

  getAlertType(sensorType, data) {
    switch (sensorType) {
      case 'temperature': {
        const { thi_status } = calculateTHIStatus(data.temp, data.humidity || 50);
        if (thi_status === 'Siaga') return 'temperature_warning';
        if (thi_status === 'Bahaya') return 'temperature_danger';
        if (thi_status === 'Sangat Bahaya') return 'temperature_critical';
        return 'temperature_normal';
      }
      case 'humidity': {
        const { thi_status } = calculateTHIStatus(data.temp, data.humidity);
        return ['Siaga', 'Bahaya', 'Sangat Bahaya'].includes(thi_status) ? 'humidity_high' : 'humidity_normal';
      }
      case 'sound': {
        const soundStatus = calculateSoundStatus(data.db);
        return soundStatus === 'Waspada' ? 'sound_warning' : soundStatus === 'Urgent' ? 'sound_urgent' : 'sound_normal';
      }
      case 'posture': {
        const { posture_status } = calculatePostureStatus(
          data.posture, data.total_time_seen_s, data.last_posture_since_s
        );
        return posture_status === 'Warning' ? 'posture_warning' : 'posture_normal';
      }
      case 'camera':
        return 'motion_detected';
      default:
        return 'unknown';
    }
  }
}

module.exports = new AlertService();
