/**
 * User Model
 * Handles all user data including wallet, referrals, and security
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  // ─── Basic Info ──────────────────────────────────────────────
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    default: 'Nigeria',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },

  // ─── Auth ─────────────────────────────────────────────────────
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  googleId: String,
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },

  // ─── Wallet ───────────────────────────────────────────────────
  wallet: {
    balance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
  },

  // ─── Referral ─────────────────────────────────────────────────
  referralCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  referralEarnings: {
    type: Number,
    default: 0,
  },
  referralCount: {
    type: Number,
    default: 0,
  },

  // ─── Surveys & Activity ────────────────────────────────────────
  surveysCompleted: {
    type: Number,
    default: 0,
  },
  completedSurveys: [{
    surveyId: String,
    completedAt: { type: Date, default: Date.now },
    earnings: Number,
  }],
  completedOffers: [{
    offerId: String,
    provider: String,
    completedAt: { type: Date, default: Date.now },
    earnings: Number,
  }],

  // ─── Daily Bonus ──────────────────────────────────────────────
  dailyBonusClaimed: {
    type: Boolean,
    default: false,
  },
  lastDailyBonusDate: Date,
  dailyBonusStreak: {
    type: Number,
    default: 0,
  },

  // ─── Spin Wheel ───────────────────────────────────────────────
  lastSpinDate: Date,
  spinCount: {
    type: Number,
    default: 0,
  },

  // ─── Security & Anti-fraud ────────────────────────────────────
  ipAddresses: [String],
  deviceFingerprints: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: String,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  lastLogin: Date,
  lastLoginIP: String,

  // ─── Notifications ────────────────────────────────────────────
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    survey: { type: Boolean, default: true },
    payment: { type: Boolean, default: true },
  },

  // ─── Bank Details ─────────────────────────────────────────────
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    bankCode: String,
    paystackRecipientCode: String,
  },
  cryptoWallet: {
    type: String,
    network: String,
  },

}, { timestamps: true });

// ─── Indexes ──────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ createdAt: -1 });

// ─── Pre-save: Hash password & generate referral code ─────────
userSchema.pre('save', async function (next) {
  // Generate unique referral code
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }

  // Hash password only if modified
  if (!this.isModified('password') || !this.password) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Methods ──────────────────────────────────────────────────
userSchema.methods.generateReferralCode = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SE';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.__v;
  return obj;
};

// ─── Virtual: Full Name ───────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
