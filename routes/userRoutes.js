const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const User = require("../models/User"); 

// Upload profile pic
router.post('/profile/upload', upload.single('profilePic'), userController.uploadProfilePic);

// Edit profile
router.put('/profile/edit', userController.editProfile);

// GET current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
