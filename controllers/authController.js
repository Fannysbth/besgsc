const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

// ====================== REGISTER ======================
exports.registerUser = async (req, res) => {
  let { username, email, phone, password } = req.body;

  try {
    // Trim input
    username = username.trim();
    email = email.trim();
    phone = phone.trim();
    password = password.normalize('NFC');

    // Cek email atau nomor HP sudah ada
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email atau nomor HP sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword
    });
    await newUser.save();

    // Buat token JWT
    const token = generateToken(newUser);

    // Kirim token sebagai cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// ====================== LOGIN GOOGLE ======================
exports.loginSuccess = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.email) return res.redirect(`${FRONTEND_URL}/login`);

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`${FRONTEND_URL}/Dashboardcoba`);
  } catch (err) {
    console.error(err);
    res.redirect(`${FRONTEND_URL}/login`);
  }
};

exports.loginFailure = (req, res) => {
  res.status(401).json({ success: false, message: 'Login gagal' });
};

// ====================== LOGIN USERNAME/EMAIL ======================
exports.loginWithPassword = async (req, res) => {
  let { usernameOrEmail, password } = req.body;

  try {
    usernameOrEmail = usernameOrEmail.trim();
    password = password.normalize('NFC');

    // Cari user berdasarkan username atau email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'User login via Google' });
    }

    // Debug (optional, bisa dihapus setelah fix)
    console.log("Login attempt:", usernameOrEmail, password);
    console.log("DB password hash:", user.password);
    console.log("Input hex:", Buffer.from(password, 'utf8').toString('hex'));

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    // Generate token
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// ====================== LOGOUT ======================
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
};
