const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  generateQuiz,
  getQuizzes,
  getSingleQuiz,
  attemptQuiz,
  deleteQuiz
} = require('../controllers/quizController');

// Configure Multer for in-memory PDF parsing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All quiz routes are protected
router.use(protect);

router.post('/generate', upload.single('file'), generateQuiz);

router.route('/')
  .get(getQuizzes);

router.route('/:id')
  .get(getSingleQuiz)
  .delete(deleteQuiz);

router.post('/:id/attempt', attemptQuiz);

module.exports = router;
