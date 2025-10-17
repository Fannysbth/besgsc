const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('Email tidak tersedia dari Google'), null);

    // Cari user dulu pakai email
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email,
        username: profile.displayName?.replace(/\s+/g, '_').toLowerCase() || "user",
        phone: null,
        profilePic: profile.photos?.[0]?.value || '',
        subscribedAlerts: [
          { sensorType: 'temperature', sensorId: 'all', threshold: 35, enabled: true },
          { sensorType: 'humidity', sensorId: 'all', threshold: 80, enabled: true },
          { sensorType: 'sound', sensorId: 'all', threshold: 85, enabled: true },
          { sensorType: 'camera', sensorId: 'all', enabled: true }
        ]
      });
    }

    // Kirim user ke controller, token dibuat di loginSuccess
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
