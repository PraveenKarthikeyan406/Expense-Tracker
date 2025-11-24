const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetOTP, sendSignupVerificationOTP } = require('../utils/mailer');
const { validateName, validateEmail, validatePassword } = require('../utils/validators');
const auth = require('../middleware/auth');


router.post('/signup-send-otp', async (req, res) => {
  try {
    let { email, password, name, role } = req.body;
    
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({ message: nameValidation.message });
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }
    
    const passwordValidation = validatePassword(password, nameValidation.value);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    
    email = emailValidation.value;
    name = nameValidation.value;
    
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const userRole = role || 'user';
    const user = new User({
      email,
      passwordHash,
      name,
      role: userRole,
      isEmailVerified: false,
      signupOTPHash: otpHash,
      signupOTPExpiresAt: new Date(Date.now() + 10 * 60 * 1000) 
    });
    await user.save();
    
    await sendSignupVerificationOTP(email, otp);
    
    return res.json({ 
      message: 'OTP sent to your email address. Please verify to complete signup.',
      userId: user._id 
    });
  } catch (err) {
    console.error('Error in /signup-send-otp:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/signup-verify-otp', async (req, res) => {
  try {
    let { userId, otp } = req.body;
    
    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }
    
    otp = typeof otp === 'string' ? otp.trim() : '';
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified. Please login.' });
    }
    
    if (!user.signupOTPHash || !user.signupOTPExpiresAt || user.signupOTPExpiresAt < new Date()) {
   
      await User.findByIdAndDelete(userId);
      return res.status(400).json({ message: 'OTP has expired. Please signup again.' });
    }
    
    const isMatch = await bcrypt.compare(otp, user.signupOTPHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    user.isEmailVerified = true;
    user.signupOTPHash = undefined;
    user.signupOTPExpiresAt = undefined;
    await user.save();
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    
    return res.json({ 
      token, 
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      message: 'Email verified successfully. Welcome!'
    });
  } catch (err) {
    console.error('Error in /signup-verify-otp:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role || 'user'; 
    const user = new User({ email, passwordHash, name, role: userRole, isEmailVerified: true });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email, name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


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
