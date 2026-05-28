const express = require('express');
const router = express.Router();
const { requestWithdrawal, getUserWithdrawals, verifyBankAccount, getBankList, saveBankDetails } = require('../controllers/withdrawalController');
const { protect, requireVerified } = require('../middleware/auth');

router.use(protect);
router.get('/banks', getBankList);
router.post('/verify-bank', verifyBankAccount);
router.post('/save-bank', saveBankDetails);
router.get('/', getUserWithdrawals);
router.post('/', requireVerified, requestWithdrawal);

module.exports = router;
