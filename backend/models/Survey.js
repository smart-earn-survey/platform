/**
 * Survey Model
 */
const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['lifestyle', 'technology', 'health', 'finance', 'entertainment', 'education', 'food', 'travel', 'general'],
    default: 'general',
  },
  reward: { type: Number, required: true, min: 0 }, // in Naira
  estimatedTime: { type: Number, required: true }, // in minutes
  url: { type: String, required: true },
  provider: {
    type: String,
    enum: ['manual', 'cpx_research', 'bitlabs', 'offertoro', 'adgate'],
    default: 'manual',
  },
  externalId: String, // ID from the provider
  isActive: { type: Boolean, default: true },
  completionLimit: { type: Number, default: null }, // null = unlimited
  totalCompletions: { type: Number, default: 0 },
  requiredCountries: [String], // empty = all countries allowed
  requiredAge: { min: Number, max: Number },
  tags: [String],
  image: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  },
  expiresAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

surveySchema.index({ isActive: 1, createdAt: -1 });
surveySchema.index({ provider: 1 });

module.exports = mongoose.model('Survey', surveySchema);
