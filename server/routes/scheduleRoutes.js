const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { studyBlockValidation } = require('../middleware/validate');
const {
  getWeeklySchedule,
  generateAISchedule,
  createStudyBlock,
  updateStudyBlock,
  deleteStudyBlock,
  logFocusScore
} = require('../controllers/scheduleController');

// All schedule routes are protected
router.use(protect);

router.get('/weekly', getWeeklySchedule);
router.post('/generate', generateAISchedule);

router.post('/blocks', studyBlockValidation, createStudyBlock);
router.route('/blocks/:id')
  .put(updateStudyBlock)
  .delete(deleteStudyBlock);

router.post('/blocks/:id/focus', logFocusScore);

module.exports = router;
