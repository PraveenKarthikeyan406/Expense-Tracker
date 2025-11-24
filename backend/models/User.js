const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetPasswordOTPHash: { type: String },
  resetPasswordOTPExpiresAt: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  signupOTPHash: { type: String },
  signupOTPExpiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
