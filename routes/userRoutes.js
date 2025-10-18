// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const User = require("../models/User"); 

// Semua route harus dilindungi authMiddleware
router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log('GET /me - User ID:', req.user.id); // Debug
    
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    console.log('User found:', user.email); // Debug
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error in /me route:', err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route lainnya juga harus dilindungi
router.post('/profile/upload', authMiddleware, upload.single('profilePic'), userController.uploadProfilePic);
router.put('/profile/edit', authMiddleware, userController.editProfile);

module.exports = router;