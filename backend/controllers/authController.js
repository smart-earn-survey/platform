/**
 * Auth Controller
 * Handles registration, login, email verification, password reset
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Notification, Referral } = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { sendEmail } = require('../utils/email');

// ─── Generate JWT ─────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// ─── Register ─────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, referralCode, country } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Detect IP
    const ip = req.ip || req.headers['x-forwarded-for'] || '';

    // Find referrer if referral code provided
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      country: country || 'Nigeria',
      referredBy: referrer ? referrer._id : null,
      ipAddresses: [ip],
    });

    // Handle referral
    if (referrer) {
      const commissionPercent = parseFloat(process.env.REFERRAL_COMMISSION_PERCENT || 10);
      const signupBonus = parseFloat(process.env.SIGNUP_BONUS || 50);
      const commission = (signupBonus * commissionPercent) / 100;

      await Referral.create({
        referrer: referrer._id,
        referee: user._id,
        commissionEarned: commission,
        referralCode: referralCode.toUpperCase(),
        status: 'active',
      });

      // Credit referrer
      await User.findByIdAndUpdate(referrer._id, {
        $inc: {
          'wallet.balance': commission,
          'wallet.totalEarned': commission,
          referralEarnings: commission,
          referralCount: 1,
        },
      });

      await Transaction.create({
        user: referrer._id,
        type: 'credit',
        category: 'referral',
        amount: commission,
        description: `Referral bonus from ${user.firstName} ${user.lastName}`,
        status: 'completed',
      });

      // Notify referrer
      await Notification.create({
        user: referrer._id,
        title: 'New Referral!',
        message: `${user.firstName} joined using your referral link. You earned ₦${commission}!`,
        type: 'referral',
      });
    }

    // Credit signup bonus to new user
    const signupBonus = parseFloat(process.env.SIGNUP_BONUS || 50);
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'wallet.balance': signupBonus, 'wallet.totalEarned': signupBonus },
    });

    await Transaction.create({
      user: user._id,
      type: 'credit',
      category: 'signup_bonus',
      amount: signupBonus,
      description: 'Welcome bonus for joining Smart Earn Survey!',
      status: 'completed',
    });

    // Send email verification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Smart Earn Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Smart Earn Survey</h1>
            <p style="color: #d1fae5; margin: 5px 0;">Answer Surveys and Earn Daily</p>
          </div>
          <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Welcome, ${user.firstName}! 🎉</h2>
            <p style="color: #6b7280;">Thank you for joining Smart Earn Survey. Please verify your email to get started.</p>
            <p style="color: #6b7280;">You've received a ₦${signupBonus} welcome bonus!</p>
            <a href="${verifyURL}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Verify Email Address</a>
            <p style="color: #9ca3af; font-size: 12px;">This link expires in 24 hours. If you didn't register, ignore this email.</p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 20px;">Powered by Lee Smart Tech</p>
        </div>
      `,
    }).catch(err => console.error('Email send failed:', err));

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        referralCode: user.referralCode,
        wallet: { balance: signupBonus, pendingBalance: 0, totalEarned: signupBonus },
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── Login ────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: `Account suspended: ${user.banReason}` });
    }

    if (user.isAccountLocked()) {
      const waitMins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ success: false, message: `Account locked. Try again in ${waitMins} minutes.` });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    await user.save();

    const token = generateToken(user._id);
    const freshUser = await User.findById(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: freshUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── Verify Email ─────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    await Notification.create({
      user: user._id,
      title: 'Email Verified!',
      message: 'Your email has been verified. Start earning now!',
      type: 'system',
    });

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};

// ─── Forgot Password ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset - Smart Earn Survey',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Smart Earn Survey</h1>
          </div>
          <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937;">Reset Your Password</h2>
            <p style="color: #6b7280;">Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetURL}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Reset Password</a>
            <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send reset email.' });
  }
};

// ─── Reset Password ───────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, message: 'Password reset successful!', token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
};

// ─── Get Me ───────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
};

// ─── Resend Verification ──────────────────────────────────────
exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Smart Earn Account',
      html: `<a href="${verifyURL}">Click to verify email</a>`,
    });

    res.json({ success: true, message: 'Verification email resent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resend verification.' });
  }
};
