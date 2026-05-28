/**
 * Webhook Routes - Handles callbacks from survey providers
 * CPX Research, BitLabs, OfferToro, AdGate
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { Notification } = require('../models/Notification');

// ─── CPX Research Postback ────────────────────────────────────
router.get('/cpx-research', async (req, res) => {
  try {
    const { ext_user_id, reward_amount, hash, status } = req.query;

    // Verify hash
    const expectedHash = crypto
      .createHash('md5')
      .update(`${ext_user_id}${process.env.CPX_RESEARCH_HASH_KEY}`)
      .digest('hex');

    if (hash !== expectedHash) {
      console.warn('CPX Research: Invalid hash for user', ext_user_id);
      return res.status(400).send('1'); // CPX expects '1' for error
    }

    if (status !== '1') return res.send('1');

    const user = await User.findById(ext_user_id);
    if (!user) return res.send('1');

    const amount = parseFloat(reward_amount) || 0;
    if (amount <= 0) return res.send('1');

    // Credit user
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'wallet.balance': amount, 'wallet.totalEarned': amount, surveysCompleted: 1 },
    });

    await Transaction.create({
      user: user._id,
      type: 'credit',
      category: 'survey',
      amount,
      description: 'CPX Research survey completed',
      metadata: { provider: 'cpx_research', ...req.query },
    });

    await Notification.create({
      user: user._id,
      title: '🎉 Survey Reward Received!',
      message: `You earned ₦${amount} from a CPX Research survey!`,
      type: 'survey',
    });

    res.send('1'); // CPX expects '1' for success
  } catch (err) {
    console.error('CPX Research webhook error:', err);
    res.send('1');
  }
});

// ─── BitLabs Postback ─────────────────────────────────────────
router.get('/bitlabs', async (req, res) => {
  try {
    const { uid, reward, survey_id } = req.query;

    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ success: false });

    const amount = parseFloat(reward) || 0;
    if (amount <= 0) return res.json({ success: false });

    await User.findByIdAndUpdate(user._id, {
      $inc: { 'wallet.balance': amount, 'wallet.totalEarned': amount, surveysCompleted: 1 },
      $push: { completedOffers: { offerId: survey_id, provider: 'bitlabs', earnings: amount } },
    });

    await Transaction.create({
      user: user._id,
      type: 'credit',
      category: 'survey',
      amount,
      description: 'BitLabs survey completed',
      metadata: { provider: 'bitlabs', surveyId: survey_id },
    });

    await Notification.create({
      user: user._id,
      title: '💰 BitLabs Reward!',
      message: `You earned ₦${amount} from BitLabs!`,
      type: 'survey',
    });

    res.json({ success: true });
  } catch (err) {
    console.error('BitLabs webhook error:', err);
    res.status(500).json({ success: false });
  }
});

// ─── OfferToro Postback ───────────────────────────────────────
router.get('/offertoro', async (req, res) => {
  try {
    const { user_id, payout, oid, secret } = req.query;

    if (secret !== process.env.OFFERTORO_SECRET) {
      return res.status(401).send('Invalid secret');
    }

    const user = await User.findById(user_id);
    if (!user) return res.status(404).send('User not found');

    const amount = parseFloat(payout) || 0;
    if (amount <= 0) return res.send('OK');

    // Prevent duplicate
    const existing = await Transaction.findOne({ 'metadata.offerId': oid, 'metadata.provider': 'offertoro' });
    if (existing) return res.send('OK');

    await User.findByIdAndUpdate(user._id, {
      $inc: { 'wallet.balance': amount, 'wallet.totalEarned': amount },
      $push: { completedOffers: { offerId: oid, provider: 'offertoro', earnings: amount } },
    });

    await Transaction.create({
      user: user._id,
      type: 'credit',
      category: 'offer',
      amount,
      description: 'OfferToro offer completed',
      metadata: { provider: 'offertoro', offerId: oid },
    });

    await Notification.create({
      user: user._id,
      title: '🎯 Offer Completed!',
      message: `You earned ₦${amount} from an OfferToro offer!`,
      type: 'survey',
    });

    res.send('1');
  } catch (err) {
    console.error('OfferToro webhook error:', err);
    res.send('0');
  }
});

// ─── AdGate Media Postback ────────────────────────────────────
router.get('/adgate', async (req, res) => {
  try {
    const { user_id, amount, oid, secret } = req.query;

    if (secret !== process.env.ADGATE_MEDIA_API_KEY) {
      return res.status(401).send('Invalid');
    }

    const user = await User.findById(user_id);
    if (!user) return res.status(404).send('Not found');

    const reward = parseFloat(amount) || 0;
    if (reward <= 0) return res.send('ok');

    const existing = await Transaction.findOne({ 'metadata.offerId': oid, 'metadata.provider': 'adgate' });
    if (existing) return res.send('ok');

    await User.findByIdAndUpdate(user._id, {
      $inc: { 'wallet.balance': reward, 'wallet.totalEarned': reward },
      $push: { completedOffers: { offerId: oid, provider: 'adgate', earnings: reward } },
    });

    await Transaction.create({
      user: user._id,
      type: 'credit',
      category: 'offer',
      amount: reward,
      description: 'AdGate Media offer completed',
      metadata: { provider: 'adgate', offerId: oid },
    });

    res.send('ok');
  } catch (err) {
    console.error('AdGate webhook error:', err);
    res.send('error');
  }
});

// ─── Paystack Payment Webhook ──────────────────────────────────
router.post('/paystack', async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body);
    if (event.event === 'transfer.success') {
      const Withdrawal = require('../models/Withdrawal');
      await Withdrawal.findOneAndUpdate(
        { providerReference: event.data.reference },
        { status: 'completed' }
      );
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Paystack webhook error:', err);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

module.exports = router;
