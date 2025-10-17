const cron = require('node-cron');
const SensorData = require('../models/SensorData');
const User = require('../models/User');
const WhatsAppService = require('./whatsappService');

cron.schedule('0 * * * *', async () => { // setiap jam
  try {
    const now = new Date();
    const ttlDays = 6;
    const threshold = new Date(now.getTime() - ttlDays * 24*60*60*1000);

    // Data yang akan expired besok
    const willExpire = await SensorData.find({
      timestamp: { $lt: new Date(threshold.getTime() + 24*60*60*1000) }
    });

    if (willExpire.length > 0) {
      console.log(`⚠️ ${willExpire.length} data sensor akan dihapus besok`);

      // Kirim WA ke semua user
      const users = await User.find({ phone: { $exists: true } });
      for (const user of users) {
        await WhatsAppService.sendAlert(user._id, {
          message: `⚠️ Peringatan: Ada ${willExpire.length} data sensor akan dihapus besok (${now.toLocaleDateString()})`
        });
      }

      // Emit WebSocket warning juga
      if (global.io) global.io.emit('ttl-warning', willExpire);
    }
  } catch (err) {
    console.error('Error notifyTTL:', err);
  }
});
