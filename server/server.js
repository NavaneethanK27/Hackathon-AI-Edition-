const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite default port
  'http://127.0.0.1:5173',
  'http://172.20.50.10:5174',
  'http://172.20.50.10:5175',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const isAllowedOrigin = allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== 'production' &&
        (origin.startsWith('http://localhost:') ||
         origin.startsWith('http://127.0.0.1:') ||
         origin.startsWith('http://172.20.50.10:')));

    if (!isAllowedOrigin) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const taskRoutes = require('./routes/taskRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const aiRoutes = require('./routes/aiRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Mount Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', quizRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Cron Job: Burnout check runs daily at midnight (0 0 * * *)
// We also implement an immediate trigger utility inside controllers for testing.
cron.schedule('0 0 * * *', async () => {
  console.log('--- Running Scheduled Daily Burnout Audit ---');
  try {
    const User = require('./models/User');
    const { calculateBurnoutScore } = require('./services/burnoutDetector');
    const StudyBlock = require('./models/StudyBlock');

    const users = await User.find({ onboardingCompleted: true }).lean();
    console.log(`Auditing ${users.length} users...`);

    for (const user of users) {
      const burnoutResult = await calculateBurnoutScore(user._id);
      console.log(`User: ${user.email} - Burnout Score: ${burnoutResult.burnoutScore}`);

      if (burnoutResult.burnoutScore > 0.65) {
        console.log(`Burnout score high for ${user.email}. Injecting wellness breaks...`);
        // Find tomorrow's study blocks and inject standard wellness breaks
        const tomorrowStart = new Date();
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date();
        tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);
        tomorrowEnd.setHours(0, 0, 0, 0);

        // Fetch study blocks scheduled for tomorrow
        const tomorrowBlocks = await StudyBlock.find({
          user: user._id,
          startTime: { $gte: tomorrowStart, $lt: tomorrowEnd },
          isBreak: false
        }).sort({ startTime: 1 });

        if (tomorrowBlocks.length > 1) {
          // Find middle slot and inject a 15-minute wellness break
          const midPointIndex = Math.floor(tomorrowBlocks.length / 2);
          const pivotBlock = tomorrowBlocks[midPointIndex];
          
          const breakStart = new Date(pivotBlock.startTime.getTime() - 15 * 60 * 1000);
          const breakEnd = new Date(pivotBlock.startTime.getTime());

          await StudyBlock.create({
            user: user._id,
            title: '🌸 AI-Injected Wellness Break',
            startTime: breakStart,
            endTime: breakEnd,
            status: 'scheduled',
            isBreak: true,
            notes: 'Proactively injected by StudyFlow AI to mitigate your burnout risk. Take a walk, stretch, or hydrate!'
          });
          
          console.log(`Wellness break successfully scheduled for ${user.email} before study block: ${pivotBlock.title}`);
        }
      }
    }
    console.log('--- Scheduled Burnout Audit Completed ---');
  } catch (error) {
    console.error('Error running daily scheduled burnout check:', error);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StudyFlow AI server running on port ${PORT}`);
});
