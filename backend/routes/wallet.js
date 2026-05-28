// ===== routes/wallet.js =====
const express = require('express');
const walletRouter = express.Router();
const { getWallet, getTransactions, claimDailyBonus, spinWheel, getEarningsSummary } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

walletRouter.use(protect);
walletRouter.get('/', getWallet);
walletRouter.get('/transactions', getTransactions);
walletRouter.get('/summary', getEarningsSummary);
walletRouter.post('/daily-bonus', claimDailyBonus);
walletRouter.post('/spin', spinWheel);

module.exports = walletRouter;
