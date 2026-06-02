const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const path = require("path");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
const envRootPath = path.join(__dirname, ".env");
const envServicePath = path.join(__dirname, "services", ".env");

dotenv.config({ path: envRootPath });
dotenv.config({ path: envServicePath });

// Create Express App
const app = express();

// Connect MongoDB
connectDB();

// Seed a default development user for local testing
(async () => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const User = require('./models/User');
      const defaultEmail = 'test@studyflow.dev';
      const existingUser = await User.findOne({ email: defaultEmail });

      if (!existingUser) {
        await User.create({
          name: 'Test User',
          email: defaultEmail,
          password: 'password123',
          onboardingCompleted: true,
          currentStreak: 1,
          totalXP: 150,
          level: 1
        });
        console.log('✅ Seeded default test user:', defaultEmail);
      }
    } catch (seedError) {
      console.error('Failed to seed default user:', seedError.message);
    }
  }
})();

// ==============================
// CORS Configuration
// ==============================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:");

      if (!isAllowed) {
        return callback(
          new Error("CORS policy blocked this origin."),
          false
        );
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

// ==============================
// Body Parser
// ==============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Health Check Route
// ==============================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "UP",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// ==============================
// Import Routes
// ==============================

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const taskRoutes = require("./routes/taskRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const aiRoutes = require("./routes/aiRoutes");
const quizRoutes = require("./routes/quizRoutes");

// ==============================
// Route Middleware
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quizzes", quizRoutes);

// ==============================
// Error Handler
// ==============================

app.use(errorHandler);

// ==============================
// Burnout Detection Cron Job
// ==============================

cron.schedule("0 0 * * *", async () => {
  console.log(
    "--- Running Scheduled Daily Burnout Audit ---"
  );

  try {
    const User = require("./models/User");
    const StudyBlock = require("./models/StudyBlock");

    const {
      calculateBurnoutScore,
    } = require("./services/burnoutDetector");

    const users = await User.find({
      onboardingCompleted: true,
    }).lean();

    console.log(`Auditing ${users.length} users...`);

    for (const user of users) {
      const burnoutResult =
        await calculateBurnoutScore(user._id);

      console.log(
        `User: ${user.email} - Burnout Score: ${burnoutResult.burnoutScore}`
      );

      if (burnoutResult.burnoutScore > 0.65) {
        console.log(
          `Burnout risk detected for ${user.email}`
        );

        const tomorrowStart = new Date();

        tomorrowStart.setDate(
          tomorrowStart.getDate() + 1
        );

        tomorrowStart.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date();

        tomorrowEnd.setDate(
          tomorrowEnd.getDate() + 2
        );

        tomorrowEnd.setHours(0, 0, 0, 0);

        const tomorrowBlocks =
          await StudyBlock.find({
            user: user._id,
            startTime: {
              $gte: tomorrowStart,
              $lt: tomorrowEnd,
            },
            isBreak: false,
          }).sort({ startTime: 1 });

        if (tomorrowBlocks.length > 1) {
          const middleIndex = Math.floor(
            tomorrowBlocks.length / 2
          );

          const pivotBlock =
            tomorrowBlocks[middleIndex];

          const breakStart = new Date(
            pivotBlock.startTime.getTime() -
            15 * 60 * 1000
          );

          const breakEnd = new Date(
            pivotBlock.startTime.getTime()
          );

          await StudyBlock.create({
            user: user._id,
            title: "🌸 AI Wellness Break",
            startTime: breakStart,
            endTime: breakEnd,
            status: "scheduled",
            isBreak: true,
            notes:
              "AI injected wellness break to reduce burnout.",
          });

          console.log(
            `Wellness break added for ${user.email}`
          );
        }
      }
    }

    console.log(
      "--- Scheduled Burnout Audit Completed ---"
    );
  } catch (error) {
    console.error(
      "Burnout Cron Error:",
      error.message
    );
  }
});

// ==============================
// Start Server
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 StudyFlow AI server running on port ${PORT}`
  );
});