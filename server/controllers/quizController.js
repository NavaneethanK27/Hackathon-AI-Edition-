const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { generateFromText } = require('../services/quizGenerator');
const pdf = require('pdf-parse');

// @desc    Generate quiz from text paste or PDF file upload
// @route   POST /api/quizzes/generate
// @access  Private
const generateQuiz = async (req, res, next) => {
  try {
    let sourceText = '';
    const { courseId, text } = req.body;

    // 1. If file uploaded, extract text using pdf-parse
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ success: false, message: 'Invalid file format. Only PDF files are supported.' });
      }
      
      try {
        const parsedPdf = await pdf(req.file.buffer);
        sourceText = parsedPdf.text;
      } catch (pdfErr) {
        console.error('Error parsing uploaded PDF:', pdfErr.message);
        return res.status(500).json({ success: false, message: 'Failed to extract text from the PDF file.' });
      }
    } else {
      sourceText = text;
    }

    if (!sourceText || sourceText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient source content. Paste at least 50 characters or upload a structured PDF.'
      });
    }

    // 2. Call generator service
    const quiz = await generateFromText(sourceText, courseId, req.user._id);

    return res.status(201).json({
      success: true,
      message: 'Interactive study quiz successfully compiled!',
      quiz
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all quizzes for user
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).populate('course').sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz details
// @route   GET /api/quizzes/:id
// @access  Private
const getSingleQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id }).populate('course');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    return res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Attempt quiz & record score (gamified)
// @route   POST /api/quizzes/:id/attempt
// @access  Private
const attemptQuiz = async (req, res, next) => {
  try {
    const { score } = req.body;
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    const attempt = {
      score,
      totalQuestions,
      percentage,
      attemptedAt: new Date()
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    // Reward XP based on performance!
    // Base completion: 30 XP, flawless perfect score adds +50 XP, passing (>70%) adds +20 XP
    const user = await User.findById(req.user._id);
    let xpGained = 30;

    if (percentage === 100) {
      xpGained += 50;
    } else if (percentage >= 70) {
      xpGained += 20;
    }

    if (user) {
      user.totalXP += xpGained;
      if (user.totalXP >= user.level * 500) {
        user.level += 1;
      }
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: `Quiz completed! Score: ${score}/${totalQuestions} (${percentage}%)`,
      attempt,
      xpGained
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found or unauthorized' });
    }
    return res.status(200).json({
      success: true,
      message: 'Quiz successfully deleted.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuiz,
  getQuizzes,
  getSingleQuiz,
  attemptQuiz,
  deleteQuiz
};
