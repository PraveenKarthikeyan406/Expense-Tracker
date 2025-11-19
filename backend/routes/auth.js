const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetOTP } = require('../utils/mailer');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role || 'user'; // Default to 'user' if not provided
    const user = new User({ email, passwordHash, name, role: userRole });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email, name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password - generate and send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    let { email, category } = req.body;
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    category = typeof category === 'string' ? category.trim().toLowerCase() : '';

    if (!email || !category) {
      return res.status(400).json({ message: 'Email and category are required' });
    }

    const role = category === 'admin' ? 'admin' : 'user';
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: 'Email not found for selected category' });
    }

    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    user.resetPasswordOTPHash = otpHash;
    user.resetPasswordOTPExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendPasswordResetOTP(user.email, otp);

    return res.json({ message: 'OTP sent to your email address' });
  } catch (err) {
    console.error('Error in /forgot-password:', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
  }
});

// Reset Password - verify OTP and update password
router.post('/reset-password', async (req, res) => {
  try {
    let { email, category, otp, newPassword } = req.body;
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    category = typeof category === 'string' ? category.trim().toLowerCase() : '';
    otp = typeof otp === 'string' ? otp.trim() : '';
    newPassword = typeof newPassword === 'string' ? newPassword : '';

    if (!email || !category || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const role = category === 'admin' ? 'admin' : 'user';
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: 'Email not found for selected category' });
    }

    if (!user.resetPasswordOTPHash || !user.resetPasswordOTPExpiresAt || user.resetPasswordOTPExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTPHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    user.resetPasswordOTPHash = undefined;
    user.resetPasswordOTPExpiresAt = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful. Please login.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Me - return current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if(!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
