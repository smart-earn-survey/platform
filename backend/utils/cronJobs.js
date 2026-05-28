/**
 * Cron Jobs
 */

const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

// Reset daily bonus flags at midnight
exports.resetDailyBonuses = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await User.updateMany(
      { lastDailyBonusDate: { $lt: today } },
      { dailyBonusClaimed: false }
    );
    console.log('✅ Daily bonuses reset');
  } catch (err) {
    console.error('❌ Daily bonus reset failed:', err);
  }
};

// Auto-approve withdrawals older than 72 hours (optional feature)
exports.processAutoApprovals = async () => {
  try {
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const pending = await Withdrawal.find({
      status: 'pending',
      createdAt: { $lt: cutoff },
    });
    console.log(`📋 ${pending.length} withdrawals pending review`);
  } catch (err) {
    console.error('Auto-approval check failed:', err);
  }
};
