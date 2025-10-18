const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

const userController = {
  async uploadProfilePic(req, res) {
    try {
      console.log('Upload profile pic - User ID:', req.user.id); // Debug
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'user_profiles', resource_type: 'image' },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ success: false, message: "Upload failed", error });
          }

          try {
            // PERBAIKI: Gunakan req.user.id (bukan req.user._id)
            const user = await User.findByIdAndUpdate(
              req.user.id,
              { profilePic: result.secure_url },
              { new: true }
            ).select("-password");
            
            res.json({ 
              success: true, 
              message: "Profile picture updated successfully",
              user 
            });
          } catch (dbError) {
            console.error('Database update error:', dbError);
            res.status(500).json({ success: false, message: "Failed to update profile" });
          }
        }
      );
      
      uploadStream.end(req.file.buffer);
    } catch (err) {
      console.error('Upload profile pic error:', err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  },

  async editProfile(req, res) {
    try {
      console.log('Edit profile - User ID:', req.user.id); // Debug
      
      const { username, phone, location } = req.body;
      
      // Validasi input
      if (!username && !phone && !location) {
        return res.status(400).json({ 
          success: false, 
          message: "At least one field must be provided" 
        });
      }

      const updateData = {};
      if (username) updateData.username = username;
      if (phone) updateData.phone = phone;
      if (location) updateData.location = location;

      // PERBAIKI: Gunakan req.user.id dan tambahkan validasi
      const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { 
          new: true, 
          runValidators: true,
          select: "-password" // Exclude password dari response
        }
      );

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ 
        success: true, 
        message: "Profile updated successfully",
        user 
      });
    } catch (err) {
      console.error('Edit profile error:', err);
      
      // Handle validation errors
      if (err.name === 'ValidationError') {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: err.errors 
        });
      }
      
      // Handle duplicate key errors
      if (err.code === 11000) {
        return res.status(400).json({ 
          success: false, 
          message: "Username or email already exists" 
        });
      }
      
      res.status(500).json({ success: false, message: "Update profile failed" });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json({
        user: {
          username: user.username || "",
          email: user.email,
          phone: user.phone || "",
          location: user.location || "",
          profilePic: user.profilePic || "",
          subscribedAlerts: user.subscribedAlerts || []
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  }
};

module.exports = userController;