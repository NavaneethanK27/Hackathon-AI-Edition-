# StudyFlow AI — Adaptive AI Study Optimization Platform 🧠🤖

StudyFlow AI is a premium, fully featured, gamified cognitive study optimization workspace. It blends state-of-the-art AI capabilities (powered by Google Gemini 1.5 Flash) with scientific study workflows (Pomodoro, burnout alarms, course tracking, calendar balancing, and multiple-choice quizzes synthesized from coursework material).

---

## 🌟 Primary Features
1. **Dynamic AI Study Scheduler**: Synthesizes structured calendar slots based on your active subjects, task priority/difficulty, and peak focus slices.
2. **Interactive Pomodoro Focus Timer**: Gamified study counter rewarding experience points (+XP) on completion, tracking distractions, and monitoring cognitive stress.
3. **Burnout Diagnostic & Stress Auditor**: Analyzes deadline density and consecutively logged hours to identify fatigue thresholds and offer proactive crisis re-scheduling.
4. **AI Quiz Synthesis (PDF or Text)**: Upload textbook PDFs or paste summary slides to compile multiple-choice academic quizzes with instant explanations.
5. **Gamification Progression**: Accumulate experience, advance scholar levels, expand daily active streaks, and secure consistency badges.

---

## 🛠️ Technology Stack
* **Client**: React 18, Vite, Tailwind CSS, Lucide Icons, glassmorphism UI structures.
* **Server**: Node.js, Express, MongoDB/Mongoose, Google Generative AI (`@google/generative-ai`), `pdf-parse`, `multer`, `node-cron`.

---

## ⚙️ Environment Configuration

Before running the server or client, prepare the following configuration parameters.

### 1. Server Environment (`/server/.env`)
Create a file named `.env` inside the `server/` directory and populate it with:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studyflow
JWT_SECRET=your_jwt_signature_secret_phrase_here
GEMINI_API_KEY=AIzaSy... (Your Google Gemini API Key)
```
> [!NOTE]
> If `GEMINI_API_KEY` is omitted or invalid during execution, StudyFlow AI will **automatically toggle mock-sandbox modes**. The server will return high-fidelity simulated JSON responses so the application remains fully testable without keys!

### 2. Client Environment (`/client/.env`)
Create a file named `.env` inside the `client/` directory and populate it with:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Running StudyFlow AI Locally

### Step 1: Start the Backend Server
```bash
cd server
npm install
npm run dev
```
The server will boot up by default on `http://localhost:5000`. A health check endpoint is active at `GET http://localhost:5000/api/health`.

### Step 2: Start the Client Workspace
```bash
cd client
npm install
npm run dev
```
The client will launch by default on `http://localhost:5173`. Open your browser and navigate to the local address to begin!

---

## 📂 Codebase Overview

```
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── api/                # Axios interceptors (JWT, Refresh)
│   │   ├── components/         # FocusTimer, BurnoutAlert, Calendar grid, badges
│   │   ├── context/            # AuthContext (state sync, level/XP tracker)
│   │   ├── hooks/              # useTasks, useCourses, useSchedule, useAI
│   │   ├── pages/              # Landing, Dashboard, Tasks, QuizPage, AIAssistant
│   │   ├── index.css           # Global glassmorphism utilities & floating blobs
│   │   └── App.jsx & main.jsx  # Protected route configs & mount setups
│   └── tailwind.config.js      # Premium dark theme configurations
│
└── server/                     # Backend API Server
    ├── config/                 # Database Mongoose setup & Gemini hooks
    ├── controllers/            # Logic (Auth, Course, Task, Schedule, AI, Quizzes)
    ├── middleware/             # JWT protect, validator, global error boundaries
    ├── models/                 # Mongoose schemas (User, Task, StudyBlock, Quiz)
    ├── routes/                 # Endpoint routers mounted at /api
    └── services/               # AI schedulers, quiz creators, stress rating engines
```

---

## 🛡️ Verification & Robustness
* **Resilient Audio Context**: Pomodoro alerts leverage native browser `AudioContext` and hardware frequency oscillators, operating without external sound assets.
* **Responsive Styling**: Tailwind styling maps fluidly across all layouts, looking premium on standard widescreen monitors as well as strict mobile screens (e.g. 375px) via dynamic navigation menus.
* **Midnight Cron Audits**: Server automatically runs midnight cron checks to audit user fatigue levels and inject wellness breaks.
  
---

 
  
