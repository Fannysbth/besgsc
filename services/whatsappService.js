const twilio = require('twilio');
const AlertLog = require('../models/AlertLog');

class WhatsAppService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  normalizePhone(phone) {
    if (!phone) return null;
    // 0853xxxx → +62853xxxx
    if (phone.startsWith('0')) {
      return `+62${phone.slice(1)}`;
    }
    if (!phone.startsWith('+')) {
      return `+${phone}`;
    }
    return phone;
  }

  async sendAlert(user, alertData) {
    try {
      if (!user.phone) {
        console.log("⚠️ User tidak punya nomor WA, SKIP:", user._id);
        return false;
      }

      const phone = this.normalizePhone(user.phone);
      console.log("🚀 KIRIM WA KE:", phone);

      const message = await this.client.messages.create({
        body: alertData.message,
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${phone}`
      });

      console.log(`✅ WA terkirim ke ${phone} | SID: ${message.sid}`);

      await AlertLog.create({
        userId: user._id,
        ...alertData,
        sentVia: ['whatsapp'],
        status: 'sent'
      });

      return true;
    } catch (err) {
      console.error('❌ Error sending WA alert:', err);
      await AlertLog.create({ userId: user._id, ...alertData, status: 'failed' });
      return false;
    }
  }

  formatAlertMessage(sensorType, sensorData) {
    const timestamp = new Date().toLocaleString('id-ID');
    return `🚨 ALERT ${sensorType.toUpperCase()} 🚨
Sensor: ${sensorData.sensorId}
Data: ${JSON.stringify(sensorData)}
Waktu: ${timestamp}`;
  }
}

module.exports = new WhatsAppService();
