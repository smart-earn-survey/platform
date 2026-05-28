const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { Referral } = require('../models/Notification');

router.use(protect);

// Get referral stats
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referee', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 });

    const referralLink = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;

    // Leaderboard top 10
    const leaderboard = await User.find({ referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(10)
      .select('firstName lastName referralCount referralEarnings');

    res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
      totalReferrals: user.referralCount,
      totalEarnings: user.referralEarnings,
      referrals,
      leaderboard,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch referral stats.' });
  }
});

module.exports = router;
