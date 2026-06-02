const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  chatBuddy,
  checkBurnoutState,
  getWeeklyInsights,
  aiReschedule,
  optimizeSchedule
} = require('../controllers/aiController');

// All AI assistant routes are protected
router.use(protect);

router.post('/chat', chatBuddy);
router.post('/burnout-check', checkBurnoutState);
router.get('/insights', getWeeklyInsights);
router.post('/reschedule', aiReschedule);
router.post('/optimize', optimizeSchedule);

module.exports = router;
