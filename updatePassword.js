// updatePassword.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // sesuaikan path ke model User-mu

// Ganti dengan URL MongoDB-mu
const MONGO_URI = 'mongodb+srv://pkmkcsmartgoatsignalcamera_db_user:oPYAipHnRgPoiHVF@sgsc.jsvu8vs.mongodb.net/?retryWrites=true&w=majority&appName=SGSC'; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function updatePassword(username, newPassword) {
  try {
    // Generate hash baru
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update user di DB
    const user = await User.findOneAndUpdate(
      { username },
      { password: hashed },
      { new: true }
    );

    if (!user) {
      console.log(`⚠️ User ${username} tidak ditemukan`);
    } else {
      console.log(`✅ Password user ${username} berhasil diupdate`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

// Ganti 'SGSC1' dengan username dan 'kamera01' dengan password yang diinginkan
updatePassword('SGSC01', 'kamera');
