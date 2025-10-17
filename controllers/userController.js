const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

const userController = {
  async uploadProfilePic(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'user_profiles', resource_type: 'image' },
        async (error, result) => {
          if (error) return res.status(500).json({ success: false, error });

          const user = await User.findByIdAndUpdate(
            req.user._id,
            { profilePic: result.secure_url },
            { new: true }
          );
          res.json({ success: true, user });
        }
      );
      uploadStream.end(req.file.buffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  },

  async editProfile(req, res) {
    try {
      const { username, phone } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { username, phone },
        { new: true, runValidators: true }
      );
      res.json({ success: true, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Update profile gagal" });
    }
  },

  async getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: {
        username: user.username || "", // default dari Google
        email: user.email,
        phone: user.phone || "",
        location: user.location || "",
        profilePic: user.profilePic || ""
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}


};

module.exports = userController;
