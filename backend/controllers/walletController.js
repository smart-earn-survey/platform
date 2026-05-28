/**
 * Wallet Controller
 * Handles balance, transactions, daily bonus, spin wheel
 */

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { Notification } = require('../models/Notification');

// ─── Get Wallet Info ──────────────────────────────────────────
exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recentTransactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      wallet: user.wallet,
      recentTransactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet.' });
  }
};

// ─── Get All Transactions ─────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    const filter = { user: req.user._id };
    if (category) filter.category = category;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
};

// ─── Claim Daily Bonus ────────────────────────────────────────
exports.claimDailyBonus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastDailyBonusDate) {
      const lastClaim = new Date(user.lastDailyBonusDate);
      lastClaim.setHours(0, 0, 0, 0);
      if (lastClaim.getTime() === today.getTime()) {
        return res.status(400).json({ success: false, message: 'Daily bonus already claimed today!' });
      }
    }

    const bonusAmount = parseFloat(process.env.DAILY_BONUS_AMOUNT || 5);

    // Check streak
    let streak = user.dailyBonusStreak || 0;
    if (user.lastDailyBonusDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastClaim = new Date(user.lastDailyBonusDate);
      lastClaim.setHours(0, 0, 0, 0);
      streak = lastClaim.getTime() === yesterday.getTime() ? streak + 1 : 1;
    } else {
      streak = 1;
    }

    // Streak bonus multiplier
    let streakBonus = 0;
    if (streak === 7) streakBonus = 20;
    else if (streak === 14) streakBonus = 50;
    else if (streak === 30) streakBonus = 100;
    const total = bonusAmount + streakBonus;

    await User.findByIdAndUpdate(user._id, {
      $inc: { 'wallet.balance': total, 'wallet.totalEarned': total },
      dailyBonusClaimed: true,
      lastDailyBonusDate: new Date(),
      dailyBonusStreak: streak,
    });

    await Transaction.create({
      user: user._id,
      type: 'credit',
      category: 'daily_bonus',
      amount: total,
      description: `Daily bonus${streakBonus > 0 ? ` + ₦${streakBonus} streak bonus (${streak} days)` : ''} claimed!`,
    });

    await Notification.create({
      user: user._id,
      title: 'Daily Bonus Claimed!',
      message: `You earned ₦${total} today! ${streak > 1 ? `${streak}-day streak! 🔥` : ''}`,
      type: 'bonus',
    });

    res.json({
      success: true,
      message: `Daily bonus of ₦${total} claimed!`,
      amount: total,
      streak,
      streakBonus,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to claim daily bonus.' });
  }
};

// ─── Spin Wheel ───────────────────────────────────────────────
exports.spinWheel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastSpinDate) {
      const lastSpin = new Date(user.lastSpinDate);
      lastSpin.setHours(0, 0, 0, 0);
      if (lastSpin.getTime() === today.getTime()) {
        return res.status(400).json({ success: false, message: 'You can only spin once per day!' });
      }
    }

    // Spin wheel prizes
    const prizes = [
      { label: '₦5', amount: 5, weight: 30 },
      { label: '₦10', amount: 10, weight: 25 },
      { label: '₦20', amount: 20, weight: 20 },
      { label: '₦50', amount: 50, weight: 12 },
      { label: '₦100', amount: 100, weight: 8 },
      { label: '₦200', amount: 200, weight: 4 },
      { label: '₦500', amount: 500, weight: 1 },
    ];

    // Weighted random selection
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    let selected = prizes[0];
    for (const prize of prizes) {
      random -= prize.weight;
      if (random <= 0) { selected = prize; break; }
    }

    await User.findByIdAndUpdate(user._id, {
      $inc: { 'wallet.balance': selected.amount, 'wallet.totalEarned': selected.amount, spinCount: 1 },
      lastSpinDate: new Date(),
    });

    await Transaction.create({
      user: user._id,
      type: 'credit',
      category: 'spin_wheel',
      amount: selected.amount,
      description: `Spin wheel reward: ${selected.label}`,
    });

    const prizeIndex = prizes.indexOf(selected);
    res.json({ success: true, prize: selected, prizeIndex, message: `You won ${selected.label}! 🎉` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Spin failed. Please try again.' });
  }
};

// ─── Get Earnings Summary ─────────────────────────────────────
exports.getEarningsSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const [user, earningsByCategory] = await Promise.all([
      User.findById(userId),
      Transaction.aggregate([
        { $match: { user: userId, type: 'credit' } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const last30Days = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'credit',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.json({
      success: true,
      summary: {
        wallet: user.wallet,
        earningsByCategory,
        last30Days,
        dailyBonusClaimed: user.dailyBonusClaimed,
        lastSpinDate: user.lastSpinDate,
        canSpin: !user.lastSpinDate || new Date(user.lastSpinDate).toDateString() !== new Date().toDateString(),
        streak: user.dailyBonusStreak,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch summary.' });
  }
};
