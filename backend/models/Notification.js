/**
 * Notification Model
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['survey', 'payment', 'referral', 'system', 'bonus', 'warning'],
    default: 'system',
  },
  isRead: { type: Boolean, default: false },
  icon: String,
  actionUrl: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

// ─────────────────────────────────────────────────────────────────

/**
 * Referral Model
 */
const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commissionEarned: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending',
  },
  level: { type: Number, default: 1 }, // for multi-level referral
  referralCode: String,
}, { timestamps: true });

referralSchema.index({ referrer: 1 });
referralSchema.index({ referee: 1 });

const Referral = mongoose.model('Referral', referralSchema);

// ─────────────────────────────────────────────────────────────────

/**
 * Announcement Model
 */
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  },
  isActive: { type: Boolean, default: true },
  targetAll: { type: Boolean, default: true },
  targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = { Notification, Referral, Announcement };
