/**
 * Withdrawal Model
 */
const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ['bank_transfer', 'paystack', 'flutterwave', 'crypto'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    bankCode: String,
  },
  cryptoDetails: {
    address: String,
    network: String,
  },
  reference: { type: String, unique: true },
  providerReference: String, // Paystack/Flutterwave reference
  adminNote: String,
  rejectionReason: String,
  processedAt: Date,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fee: { type: Number, default: 0 },
  netAmount: Number, // amount - fee
}, { timestamps: true });

withdrawalSchema.index({ user: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ reference: 1 });

withdrawalSchema.pre('save', function (next) {
  if (!this.reference) {
    this.reference = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  if (!this.netAmount) {
    this.netAmount = this.amount - (this.fee || 0);
  }
  next();
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
