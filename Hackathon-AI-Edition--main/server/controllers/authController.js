const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generates a standard JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fallback_secret_for_studyflow_dev_mode',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password // Schema pre-save hook will encrypt this
    });

    if (user) {
      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          onboardingCompleted: user.onboardingCompleted,
          level: user.level,
          totalXP: user.totalXP,
          currentStreak: user.currentStreak
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data provided'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // We explicitly select the password because schema sets select: false by default
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      // Update user streak if necessary, based on previous active day
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (user.lastActiveDate) {
        const lastActive = new Date(user.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);
        const dayDifference = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

        if (dayDifference === 1) {
          user.currentStreak += 1;
        } else if (dayDifference > 1) {
          user.currentStreak = 1;
        }
      } else {
        user.currentStreak = 1;
      }

      user.lastActiveDate = new Date();
      await user.save();

      return res.status(200).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          onboardingCompleted: user.onboardingCompleted,
          level: user.level,
          totalXP: user.totalXP,
          currentStreak: user.currentStreak,
          peakHours: user.peakHours,
          preferredStudySessionLength: user.preferredStudySessionLength,
          dailyStudyGoalHours: user.dailyStudyGoalHours
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is already populated by protect middleware
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user onboarding and settings
// @route   PUT /api/auth/onboarding
// @access  Private
const completeOnboarding = async (req, res, next) => {
  try {
    const { peakHours, preferredStudySessionLength, dailyStudyGoalHours } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.peakHours = peakHours || user.peakHours;
    user.preferredStudySessionLength = preferredStudySessionLength || user.preferredStudySessionLength;
    user.dailyStudyGoalHours = dailyStudyGoalHours || user.dailyStudyGoalHours;
    user.onboardingCompleted = true;

    // Grant 100 XP for onboarding completion!
    user.totalXP += 100;

    // Level up check
    if (user.totalXP >= user.level * 500) {
      user.level += 1;
    }

    const updatedUser = await user.save();
    return res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh session token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_studyflow_dev_mode');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid refresh session' });
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Expired session' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  completeOnboarding,
  refreshToken
};
