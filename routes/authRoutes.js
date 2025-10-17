const express = require('express');
const router = express.Router();
const passport = require('../config/auth');
const authController = require('../controllers/authController');

// Google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/failure' }), authController.loginSuccess);

// Login failure
router.get('/failure', authController.loginFailure);

// Login username/password
router.post('/login', authController.loginWithPassword);

// Logout
router.post('/logout', authController.logout);

// Registrasi user baru
router.post('/register', authController.registerUser);

module.exports = router;
