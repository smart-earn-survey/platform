/**
 * Admin Controller
 */

const User = require('../models/User');
const Survey = require('../models/Survey');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const { Notification, Referral, Announcement } = require('../models/Notification');

// ─── Dashboard Stats ──────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, activeUsers, totalSurveys,
      pendingWithdrawals, totalWithdrawals,
      revenueAgg, recentUsers, recentWithdrawals,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      Survey.countDocuments({ isActive: true }),
      Withdrawal.countDocuments({ status: 'pending' }),
      Withdrawal.countDocuments({}),
      Withdrawal.aggregate([
        { $match: { status: { $in: ['approved', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('firstName lastName email createdAt wallet'),
      Withdrawal.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName email'),
    ]);

    // Earnings over 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, role: 'user' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const dailyWithdrawals = await Withdrawal.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'completed' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalSurveys,
        pendingWithdrawals,
        totalWithdrawals,
        totalRevenue: revenueAgg[0]?.total || 0,
        recentUsers,
        recentWithdrawals,
        dailySignups,
        dailyWithdrawals,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};

// ─── Get All Users ────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const status = req.query.status;

    const filter = { role: 'user' };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status === 'banned') filter.isBanned = true;
    if (status === 'inactive') filter.isActive = false;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// ─── Ban / Unban User ─────────────────────────────────────────
exports.toggleBanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Cannot ban admin users.' });
    }

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? reason : undefined;
    await user.save();

    if (user.isBanned) {
      await Notification.create({
        user: user._id,
        title: 'Account Suspended',
        message: `Your account has been suspended. Reason: ${reason}. Contact support for assistance.`,
        type: 'warning',
      });
    }

    res.json({ success: true, message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

// ─── Credit / Debit User ──────────────────────────────────────
exports.adjustUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, type, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const update = type === 'credit'
      ? { $inc: { 'wallet.balance': amount, 'wallet.totalEarned': amount } }
      : { $inc: { 'wallet.balance': -Math.min(amount, user.wallet.balance) } };

    await User.findByIdAndUpdate(userId, update);

    await Transaction.create({
      user: userId,
      type,
      category: type === 'credit' ? 'admin_credit' : 'admin_debit',
      amount,
      description: `Admin ${type}: ${reason}`,
      status: 'completed',
    });

    await Notification.create({
      user: userId,
      title: type === 'credit' ? '💰 Balance Credited' : '⚠️ Balance Adjusted',
      message: `Admin ${type}ed ₦${amount} to your account. Reason: ${reason}`,
      type: 'payment',
    });

    res.json({ success: true, message: `User balance ${type}ed by ₦${amount}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to adjust balance.' });
  }
};

// ─── Manage Withdrawals ───────────────────────────────────────
exports.getWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(filter)
        .populate('user', 'firstName lastName email wallet')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Withdrawal.countDocuments(filter),
    ]);

    res.json({ success: true, withdrawals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawals.' });
  }
};

exports.processWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { action, note } = req.body; // action: 'approve' | 'reject'

    const withdrawal = await Withdrawal.findById(withdrawalId).populate('user');
    if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found.' });

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Withdrawal already processed.' });
    }

    if (action === 'approve') {
      withdrawal.status = 'approved';
      withdrawal.adminNote = note;
      withdrawal.processedBy = req.user._id;
      withdrawal.processedAt = new Date();

      await User.findByIdAndUpdate(withdrawal.user._id, {
        $inc: {
          'wallet.pendingBalance': -withdrawal.amount,
          'wallet.totalWithdrawn': withdrawal.amount,
        },
      });

      await Transaction.findOneAndUpdate(
        { 'metadata.withdrawalId': withdrawalId },
        { status: 'completed' }
      );

      await Notification.create({
        user: withdrawal.user._id,
        title: '✅ Withdrawal Approved',
        message: `Your withdrawal of ₦${withdrawal.amount} has been approved and will be processed shortly.`,
        type: 'payment',
      });
    } else if (action === 'reject') {
      withdrawal.status = 'rejected';
      withdrawal.rejectionReason = note;
      withdrawal.processedBy = req.user._id;
      withdrawal.processedAt = new Date();

      // Refund balance
      await User.findByIdAndUpdate(withdrawal.user._id, {
        $inc: {
          'wallet.balance': withdrawal.amount,
          'wallet.pendingBalance': -withdrawal.amount,
        },
      });

      await Notification.create({
        user: withdrawal.user._id,
        title: '❌ Withdrawal Rejected',
        message: `Your withdrawal of ₦${withdrawal.amount} was rejected. Reason: ${note}. Amount refunded to your wallet.`,
        type: 'payment',
      });
    }

    await withdrawal.save();
    res.json({ success: true, message: `Withdrawal ${action}d successfully.`, withdrawal });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to process withdrawal.' });
  }
};

// ─── Survey Management ────────────────────────────────────────
exports.createSurvey = async (req, res) => {
  try {
    const survey = await Survey.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Survey created.', survey });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create survey.' });
  }
};

exports.updateSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found.' });
    res.json({ success: true, message: 'Survey updated.', survey });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update survey.' });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    await Survey.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Survey deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete survey.' });
  }
};

// ─── Announcements ────────────────────────────────────────────
exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Announcement created.', announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
  }
};
