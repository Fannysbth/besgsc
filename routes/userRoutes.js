const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// PERBAIKI: Semua route harus ada /api/users diawal dan dilindungi authMiddleware

// Upload profile pic - PERBAIKI PATH
router.post('/profile/upload', authMiddleware, upload.single('profilePic'), userController.uploadProfilePic);

// Edit profile - PERBAIKI PATH  
router.put('/profile/edit', authMiddleware, userController.editProfile);

// GET current user - PATH SUDAH BENAR
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;