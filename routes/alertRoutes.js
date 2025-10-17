const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const isAuthenticated = require('../middleware/authMiddleware');

router.get('/preferences', isAuthenticated, alertController.getAlertPreferences);
router.put('/preferences', isAuthenticated, alertController.updateAlertPreferences);
router.get('/history', isAuthenticated, alertController.getAlertHistory);
router.post('/test', isAuthenticated, alertController.testAlert);

module.exports = router;