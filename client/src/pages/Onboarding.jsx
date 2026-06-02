import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { 
  Sparkles, 
  Clock, 
  Trophy, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  BookOpen, 
  Target, 
  Palette 
} from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [peakHours, setPeakHours] = useState(['morning', 'afternoon']);
  const [sessionLength, setSessionLength] = useState(25);
  const [dailyGoal, setDailyGoal] = useState(2);
  
  // Course creation states
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseColor, setCourseColor] = useState('#6366f1'); // Indigo

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const handleHourToggle = (hour) => {
    if (peakHours.includes(hour)) {
      setPeakHours(prev => prev.filter(h => h !== hour));
    } else {
      setPeakHours(prev => [...prev, hour]);
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && peakHours.length === 0) {
      return setError('Please select at least one peak study time window.');
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    setError('');
    setLoading(true);

    if (!courseName.trim()) {
      setLoading(false);
      return setError('Please enter an initial subject course name to start.');
    }

    try {
      // 1. Submit onboarding profile settings
      const onboardRes = await completeOnboarding({
        peakHours,
        preferredStudySessionLength: sessionLength,
        dailyStudyGoalHours: dailyGoal
      });

      if (onboardRes && onboardRes.success) {
        // 2. Add their first Course
        await API.post('/courses', {
          name: courseName,
          code: courseCode || 'GEN',
          color: courseColor,
          description: 'Created during onboarding.'
        });

        // 3. Trigger initial AI schedule generation silently
        try {
          await API.post('/schedule/generate');
        } catch (schedErr) {
          console.warn('Initial schedule pre-calc bypassed:', schedErr.message);
        }

        navigate('/dashboard');
      } else {
        setError(onboardRes?.message || 'Failed to save academic parameters.');
      }
    } catch (err) {
      setError('An error occurred during onboarding execution.');
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6'  // Blue
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#07090e] p-6 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      
      <div className="floating-blob top-10 left-10 bg-brand-500" />
      <div className="floating-blob bottom-10 right-10 bg-indigo-500" style={{ animationDelay: '-12s' }} />

      <div className="w-full max-w-xl bg-white/70 dark:bg-[#0c0e17]/85 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
        
        {/* WIZARD STEPS PROGRESS INDICATOR */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] tracking-wider text-slate-500 dark:text-slate-300 font-extrabold uppercase">Setup Wizard</span>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-none mt-0.5">Configure Academic Copilot</h3>
            </div>
          </div>
          <span className="text-xs font-black text-slate-500 dark:text-slate-350 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
            Step {step} of 3
          </span>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-500 p-3 rounded-xl text-xs font-semibold animate-fade-in">
            {error}
          </div>
        )}

        {/* STEP 1: PEAK HOURS WINDOW */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-brand-500" />
                Select Peak Cognitive Hours
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
                When do you feel most focused? Our AI will organize your heaviest study tasks inside these active periods.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { key: 'morning', label: '☀️ Morning', range: '08:00 AM - 12:00 PM' },
                { key: 'afternoon', label: '🌤️ Afternoon', range: '12:00 PM - 04:00 PM' },
                { key: 'evening', label: '🌆 Evening', range: '04:00 PM - 08:00 PM' },
                { key: 'night', label: '🌙 Night Owl', range: '08:00 PM - 12:00 AM' }
              ].map((hour) => {
                const selected = peakHours.includes(hour.key);
                return (
                  <div
                    key={hour.key}
                    onClick={() => handleHourToggle(hour.key)}
                    className={`glass-card p-4 text-left cursor-pointer transition-all border ${
                      selected 
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10' 
                        : 'border-slate-200 hover:border-slate-350 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{hour.label}</span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-black ${
                        selected 
                          ? 'bg-brand-500 border-brand-500 text-white' 
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-550 dark:text-slate-350 font-bold mt-1 uppercase tracking-wider">{hour.range}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: DAILY GOALS & SESSIONS */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-1.5">
                <Target className="w-5 h-5 text-brand-500" />
                Define Study pacing & Goals
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
                Tune study intervals and daily caps. Shorter intervals increase concentration stamina.
              </p>
            </div>

            {/* Pomodoro Session Length Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Preferred Study block Length (Pomodoro)</label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 25, 45, 50].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setSessionLength(len)}
                    className={`py-2.5 rounded-xl border text-xs font-black transition-all ${
                      sessionLength === len
                        ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                        : 'bg-white dark:bg-[#121624] border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    {len} Mins
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Goal Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Daily Study Target Goal</label>
                <span className="text-xs font-black text-brand-500">{dailyGoal} Hours / Day</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.5"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-300 font-bold uppercase mt-1">
                <span>0.5 Hours (Casual)</span>
                <span>4 Hours (Standard)</span>
                <span>8 Hours (Intense)</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: INITIAL SUBJECT COURSE */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-1.5">
                <BookOpen className="w-5 h-5 text-brand-500" />
                Define Your First Subject Course
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
                Add at least one active course. This lets the AI scheduler map tasks to specific categories.
              </p>
            </div>

            <div className="grid gap-3 pt-2">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Machine Learning"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              {/* Code */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Course Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CS-402"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              {/* Color grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-350 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  Select Subject Calendar Tag Color
                </label>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCourseColor(c)}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                        courseColor === c
                          ? 'border-brand-500 scale-110 shadow-md shadow-brand-500/20'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {courseColor === c && <Check className="w-4.5 h-4.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTIONS BAR */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="glass-btn-secondary py-2.5 px-5 rounded-xl font-bold flex items-center gap-1 text-xs active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="glass-btn bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl py-2.5 px-5 text-xs shadow-md shadow-brand-600/10 flex items-center gap-1 active:scale-95 transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="glass-btn bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl py-2.5 px-5 text-xs shadow-md shadow-brand-600/15 flex items-center gap-1 active:scale-95 transition-all"
            >
              {loading ? 'Initializing Academic Assistant...' : 'Complete Setup & Claim +100 XP'}
              <Check className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

export default Onboarding;
