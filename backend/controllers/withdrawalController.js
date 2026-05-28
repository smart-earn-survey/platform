/**
 * Withdrawal Controller
 */

const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const { Notification } = require('../models/Notification');
const axios = require('axios');

const MIN_WITHDRAWAL = parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT || 500);
const WITHDRAWAL_FEE = 50; // ₦50 processing fee

// ─── Request Withdrawal ───────────────────────────────────────
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, bankDetails, cryptoDetails } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before withdrawing.' });
    }

    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({ success: false, message: `Minimum withdrawal is ₦${MIN_WITHDRAWAL}.` });
    }

    if (user.wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }

    const fee = method === 'crypto' ? 0 : WITHDRAWAL_FEE;
    const netAmount = amount - fee;

    // Deduct from balance, add to pending
    await User.findByIdAndUpdate(user._id, {
      $inc: {
        'wallet.balance': -amount,
        'wallet.pendingBalance': amount,
        'wallet.totalWithdrawn': 0, // will update on approval
      },
    });

    const withdrawal = await Withdrawal.create({
      user: user._id,
      amount,
      method,
      bankDetails: bankDetails || user.bankDetails,
      cryptoDetails,
      fee,
      netAmount,
      status: 'pending',
    });

    await Transaction.create({
      user: user._id,
      type: 'debit',
      category: 'withdrawal',
      amount,
      description: `Withdrawal request via ${method} - ₦${netAmount} net`,
      status: 'pending',
      metadata: { withdrawalId: withdrawal._id },
    });

    await Notification.create({
      user: user._id,
      title: 'Withdrawal Requested',
      message: `Your withdrawal of ₦${amount} is being processed. Net amount: ₦${netAmount}.`,
      type: 'payment',
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully!',
      withdrawal,
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ success: false, message: 'Withdrawal request failed.' });
  }
};

// ─── Get User Withdrawals ─────────────────────────────────────
exports.getUserWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Withdrawal.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      withdrawals,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawals.' });
  }
};

// ─── Verify Bank Account (Paystack) ───────────────────────────
exports.verifyBankAccount = async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;

    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    res.json({
      success: true,
      accountName: response.data.data.account_name,
      accountNumber: response.data.data.account_number,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Could not verify account. Please check details.' });
  }
};

// ─── Get Bank List (Paystack) ─────────────────────────────────
exports.getBankList = async (req, res) => {
  try {
    const response = await axios.get('https://api.paystack.co/bank?country=nigeria&perPage=100', {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });

    res.json({ success: true, banks: response.data.data });
  } catch (err) {
    // Fallback list
    res.json({
      success: true,
      banks: [
        { name: 'Access Bank', code: '044' },
        { name: 'First Bank', code: '011' },
        { name: 'GTBank', code: '058' },
        { name: 'Zenith Bank', code: '057' },
        { name: 'UBA', code: '033' },
        { name: 'Union Bank', code: '032' },
        { name: 'Fidelity Bank', code: '070' },
        { name: 'Sterling Bank', code: '232' },
        { name: 'Wema Bank', code: '035' },
        { name: 'Opay', code: '999992' },
        { name: 'Kuda Bank', code: '090267' },
        { name: 'PalmPay', code: '999991' },
      ],
    });
  }
};

// ─── Save Bank Details ────────────────────────────────────────
exports.saveBankDetails = async (req, res) => {
  try {
    const { bankName, accountNumber, accountName, bankCode } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      bankDetails: { bankName, accountNumber, accountName, bankCode },
    });

    res.json({ success: true, message: 'Bank details saved successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save bank details.' });
  }
};
