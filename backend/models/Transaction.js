/**
 * Transaction Model - All wallet credit/debit records
 */
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  category: {
    type: String,
    enum: ['survey', 'offer', 'referral', 'daily_bonus', 'spin_wheel', 'signup_bonus', 'withdrawal', 'admin_credit', 'admin_debit'],
    required: true,
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  reference: { type: String, unique: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  balanceBefore: Number,
  balanceAfter: Number,
}, { timestamps: true });

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ category: 1 });

// Generate reference before save
transactionSchema.pre('save', function (next) {
  if (!this.reference) {
    this.reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
