import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  ShieldAlert,
  BookOpen,
  Trophy,
  CheckCircle,
  Flame,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Adaptive AI Scheduler",
      description:
        "Generates customized study plans based on your task due dates, priority weightings, and natural peak concentration hours.",
      icon: Calendar,
      glow: "from-violet-500/20 to-indigo-500/10",
      iconColor: "text-violet-400",
    },
    {
      title: "Cognitive Burnout Prevention",
      description:
        "Our proprietary algorithm measures upcoming deadlines and consecutive study hours to inject proactive wellness breaks.",
      icon: ShieldAlert,
      glow: "from-rose-500/20 to-pink-500/10",
      iconColor: "text-rose-400",
    },
    {
      title: "Dynamic AI Quiz Generator",
      description:
        "Extracts critical topics instantly from text pastes or PDF uploads, creating AI-powered quizzes with explanations.",
      icon: BookOpen,
      glow: "from-emerald-500/20 to-cyan-500/10",
      iconColor: "text-emerald-400",
    },
    {
      title: "Gamified XP Progression",
      description:
        "Earn rank XP, gain daily streaks, and level up your scholar profile while achieving focus milestones.",
      icon: Trophy,
      glow: "from-amber-500/20 to-yellow-500/10",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060816] text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_35%)]" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:45px_45px] opacity-20" />

      {/* Floating Blobs */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-violet-600/20 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 blur-[140px] rounded-full" />

      {/* NAVBAR */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="font-black text-xl bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              StudyFlow
            </h1>

            <p className="text-[10px] tracking-[0.3em] uppercase text-slate-500 font-bold">
              AI Academic System
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/auth")}
          className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300 font-semibold text-sm backdrop-blur-xl"
        >
          Sign In
        </button>
      </header>

      {/* HERO */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-sm font-semibold backdrop-blur-xl">
            <Sparkles className="w-4 h-4" />
            Future of AI Study Optimization
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
            Study Smarter.
            <br />

            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Prevent Burnout.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-7 text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            StudyFlow AI builds adaptive schedules, predicts mental fatigue,
            creates intelligent quizzes, and gamifies productivity using AI.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:scale-[1.03] transition-all duration-300 shadow-2xl shadow-violet-500/30 font-bold flex items-center gap-2"
            >
              Start Studying Free

              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              className="px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 backdrop-blur-xl font-semibold"
              onClick={() => {
                const el = document.getElementById("features");

                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Explore Features
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
              100% Gamified Consistency
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              AI-Powered Planning
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Burnout Prevention Engine
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="relative z-20 max-w-7xl mx-auto px-6 py-20"
      >
        <div className="text-center max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-violet-400 text-xs font-bold">
            Powerful Features
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-black">
            Built For Modern Students
          </h2>

          <p className="mt-5 text-slate-400 text-lg">
            Powerful AI features designed to maximize productivity while
            protecting your mental health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-20">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 hover:-translate-y-2 transition-all duration-500 shadow-[0_10px_50px_rgba(0,0,0,0.35)]"
              >
                {/* Hover Glow */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${feature.glow}`}
                />

                {/* Border Glow */}
                <div className="absolute inset-0 rounded-[30px] border border-white/10 group-hover:border-violet-500/30 transition duration-500" />

                {/* Bottom Glow Lines */}
                <div className="absolute bottom-0 left-0 w-full h-32 opacity-40">
                  <div className="absolute bottom-0 left-10 w-40 h-40 border border-current rounded-full opacity-20" />
                  <div className="absolute bottom-[-40px] right-10 w-52 h-52 border border-current rounded-full opacity-10" />
                </div>

                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/[0.05] border border-white/10 ${feature.iconColor}`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="mt-6 text-2xl font-black text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>

                  <button className="mt-6 flex items-center gap-2 text-violet-400 font-semibold group-hover:gap-3 transition-all">
                    Learn More

                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/5 py-10 text-center text-sm text-slate-500">
        © 2026 StudyFlow AI — Powered by Gemini AI
      </footer>
    </div>
  );
};

export default LandingPage;