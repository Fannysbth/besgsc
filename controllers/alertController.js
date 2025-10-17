const User = require('../models/User');
const AlertLog = require('../models/AlertLog');

class AlertController {
  async updateAlertPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const { alerts, preferences } = req.body;

      const updateData = {};
      if (alerts) updateData.subscribedAlerts = alerts;
      if (preferences) updateData.alertPreferences = preferences;

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      );

      res.json({
        success: true,
        message: 'Alert preferences updated',
        data: {
          subscribedAlerts: user.subscribedAlerts,
          alertPreferences: user.alertPreferences
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAlertPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      res.json({
        success: true,
        data: {
          subscribedAlerts: user.subscribedAlerts,
          alertPreferences: user.alertPreferences
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAlertHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const alerts = await AlertLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AlertLog.countDocuments({ userId });

      res.json({
        success: true,
        data: alerts,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          totalAlerts: total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async testAlert(req, res, next) {
    try {
      const userId = req.user.id;
      const { sensorType } = req.body;

      // Create test sensor data
      const testData = {
        sensorType,
        sensorId: 'test_sensor',
        data: this.getTestData(sensorType)
      };

      // Process test alert
      await require('../services/alertService').processSensorData(testData);

      res.json({
        success: true,
        message: 'Test alert triggered'
      });
    } catch (error) {
      next(error);
    }
  }

  getTestData(sensorType) {
    const testData = {
      temperature: { temp: 40, humidity: 50, timestamp: new Date() },
      humidity: { humidity: 90, timestamp: new Date() },
      sound: { db: 95, frequency: 1000, timestamp: new Date() },
      camera: { 
        from: 'person', 
        to: 'car', 
        duration_prev_s: 2.5,
        confidence: 0.89 
      }
    };
    return testData[sensorType] || {};
  }
}

module.exports = new AlertController();