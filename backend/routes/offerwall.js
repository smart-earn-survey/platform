const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// Generate offerwall URLs with user tracking
router.get('/urls', async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id.toString();

    const offerwalls = [
      {
        name: 'CPX Research',
        id: 'cpx_research',
        icon: '🔬',
        description: 'Complete surveys and earn rewards',
        url: `https://offers.cpx-research.com/index.php?app_id=${process.env.CPX_RESEARCH_APP_ID}&ext_user_id=${userId}`,
        available: !!process.env.CPX_RESEARCH_APP_ID,
      },
      {
        name: 'BitLabs',
        id: 'bitlabs',
        icon: '💡',
        description: 'High-paying survey offers',
        url: `https://web.bitlabs.ai/?token=${process.env.BITLABS_TOKEN}&uid=${userId}`,
        available: !!process.env.BITLABS_TOKEN,
      },
      {
        name: 'OfferToro',
        id: 'offertoro',
        icon: '🎯',
        description: 'Wide variety of earning tasks',
        url: `https://www.offertoro.com/ifr/${process.env.OFFERTORO_APP_ID}/${userId}/0`,
        available: !!process.env.OFFERTORO_APP_ID,
      },
      {
        name: 'AdGate Media',
        id: 'adgate',
        icon: '📱',
        description: 'Install apps and complete tasks',
        url: `https://wall.adgaterewards.com/${process.env.ADGATE_MEDIA_USER_ID}/${userId}`,
        available: !!process.env.ADGATE_MEDIA_USER_ID,
      },
      {
        name: 'TheoremReach',
        id: 'theoremreach',
        icon: '🎓',
        description: 'High quality surveys with great payouts',
        url: `https://theoremreach.com/respondent_entry/direct?api_key=${process.env.THEOREMREACH_API_KEY}&user_id=${userId}`,
        available: !!process.env.THEOREMREACH_API_KEY,
      },
    ];

    res.json({ success: true, offerwalls });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch offerwall URLs.' });
  }
});

// Get user's completed offers
router.get('/completed', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, completedOffers: user.completedOffers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch completed offers.' });
  }
});

module.exports = router;