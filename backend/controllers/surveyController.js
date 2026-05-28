/**
 * Survey Controller
 */

const Survey = require('../models/Survey');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { Notification } = require('../models/Notification');

// ─── Get All Available Surveys ────────────────────────────────
exports.getSurveys = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    };

    if (category) filter.category = category;

    // Check if completionLimit is reached
    const surveys = await Survey.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out surveys the user already completed
    const user = await User.findById(req.user._id);
    const completedIds = user.completedSurveys.map(s => s.surveyId.toString());

    const availableSurveys = surveys.map(survey => ({
      ...survey.toObject(),
      isCompleted: completedIds.includes(survey._id.toString()),
    }));

    const total = await Survey.countDocuments(filter);

    res.json({
      success: true,
      surveys: availableSurveys,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch surveys.' });
  }
};

// ─── Get Single Survey ────────────────────────────────────────
exports.getSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found.' });

    const user = await User.findById(req.user._id);
    const isCompleted = user.completedSurveys.some(s => s.surveyId === req.params.id);

    res.json({ success: true, survey: { ...survey.toObject(), isCompleted } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch survey.' });
  }
};

// ─── Start Survey (returns URL) ───────────────────────────────
exports.startSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey || !survey.isActive) {
      return res.status(404).json({ success: false, message: 'Survey not available.' });
    }

    const user = await User.findById(req.user._id);
    const alreadyCompleted = user.completedSurveys.some(s => s.surveyId === req.params.id);
    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'You have already completed this survey.' });
    }

    // Build personalized survey URL
    let surveyUrl = survey.url;
    if (survey.provider === 'cpx_research') {
      const appId = process.env.CPX_RESEARCH_APP_ID;
      const hashKey = process.env.CPX_RESEARCH_HASH_KEY;
      const userId = user._id.toString();
      const hash = require('crypto').createHash('md5').update(`${userId}-${hashKey}`).digest('hex');
      surveyUrl = `${survey.url}&app_id=${appId}&ext_user_id=${userId}&hash_user=${hash}`;
    } else if (survey.provider === 'bitlabs') {
      surveyUrl = `${survey.url}?token=${process.env.BITLABS_TOKEN}&uid=${user._id}`;
    }

    res.json({ success: true, surveyUrl, survey });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to start survey.' });
  }
};

// ─── Complete Survey (manual completion) ──────────────────────
exports.completeSurvey = async (req, res) => {
  try {
    const { surveyId } = req.body;
    const survey = await Survey.findById(surveyId);

    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found.' });

    const user = await User.findById(req.user._id);
    const alreadyDone = user.completedSurveys.some(s => s.surveyId === surveyId);

    if (alreadyDone) {
      return res.status(400).json({ success: false, message: 'Survey already completed.' });
    }

    // Credit user
    await User.findByIdAndUpdate(user._id, {
      $inc: {
        'wallet.balance': survey.reward,
        'wallet.totalEarned': survey.reward,
        surveysCompleted: 1,
      },
      $push: {
        completedSurveys: { surveyId, completedAt: new Date(), earnings: survey.reward },
      },
    });

    // Update survey completion count
    await Survey.findByIdAndUpdate(surveyId, { $inc: { totalCompletions: 1 } });

    await Transaction.create({
      user: user._id,
      type: 'credit',
      category: 'survey',
      amount: survey.reward,
      description: `Completed survey: ${survey.title}`,
      metadata: { surveyId, provider: survey.provider },
    });

    await Notification.create({
      user: user._id,
      title: 'Survey Completed!',
      message: `You earned ₦${survey.reward} for completing "${survey.title}"!`,
      type: 'survey',
    });

    res.json({
      success: true,
      message: `Survey completed! You earned ₦${survey.reward}`,
      earnings: survey.reward,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to record survey completion.' });
  }
};

// ─── Get User Completed Surveys ───────────────────────────────
exports.getCompletedSurveys = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, completedSurveys: user.completedSurveys });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch completed surveys.' });
  }
};
