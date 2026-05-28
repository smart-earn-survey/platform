const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats, getUsers, toggleBanUser, adjustUserBalance,
  getWithdrawals, processWithdrawal, createSurvey, updateSurvey,
  deleteSurvey, createAnnouncement, getAnnouncements,
} = require('../controllers/adminController');
const Survey = require('../models/Survey');

router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.put('/users/:userId/ban', toggleBanUser);
router.post('/users/:userId/balance', adjustUserBalance);

// Withdrawals
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:withdrawalId', processWithdrawal);

// Surveys
router.get('/surveys', async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 });
    res.json({ success: true, surveys });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed.' });
  }
});
router.post('/surveys', createSurvey);
router.put('/surveys/:id', updateSurvey);
router.delete('/surveys/:id', deleteSurvey);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);

module.exports = router;
