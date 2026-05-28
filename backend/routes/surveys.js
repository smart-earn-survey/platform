const express = require('express');
const router = express.Router();
const { getSurveys, getSurvey, startSurvey, completeSurvey, getCompletedSurveys } = require('../controllers/surveyController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getSurveys);
router.get('/completed', getCompletedSurveys);
router.get('/:id', getSurvey);
router.post('/:id/start', startSurvey);
router.post('/complete', completeSurvey);

module.exports = router;
