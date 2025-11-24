const nodemailer = require('nodemailer');

// Transporter for sending transactional emails (e.g., password reset OTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendPasswordResetOTP(to, otp) {
  if (!to || !otp) {
    throw new Error('Email and OTP are required to send password reset email');
  }

  // If SMTP is not configured, run in dev mode: log OTP only and do not attempt to send
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP not configured. Logging OTP instead of sending email.');
    console.log(`Password reset OTP for ${to}: ${otp}`);
    return;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from,
    to,
    subject: 'Password Reset OTP - Fast Budget',
    text: `Your One-Time Password (OTP) for resetting your password is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <p>Dear user,</p>
        <p>Your One-Time Password (OTP) for resetting your password is:</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        <p>Relax. Meditate. Repeat.</p>
      </div>
    `
  };
  // In non-production, also log the OTP to the server console to help with debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Password reset OTP for ${to}: ${otp}`);
  }

  await transporter.sendMail(mailOptions);
}

async function sendSignupVerificationOTP(to, otp) {
  if (!to || !otp) {
    throw new Error('Email and OTP are required to send signup verification email');
  }

  // If SMTP is not configured, run in dev mode: log OTP only and do not attempt to send
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP not configured. Logging OTP instead of sending email.');
    console.log(`Signup verification OTP for ${to}: ${otp}`);
    return;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from,
    to,
    subject: 'Email Verification - Fast Budget',
    text: `Your One-Time Password (OTP) for email verification is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <p>Welcome to Fast Budget!</p>
        <p>Your One-Time Password (OTP) for email verification is:</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        <p>Thank you for joining us!</p>
      </div>
    `
  };
  // In non-production, also log the OTP to the server console to help with debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Signup verification OTP for ${to}: ${otp}`);
  }

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendPasswordResetOTP,
  sendSignupVerificationOTP
};
