import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useCourses from '../hooks/useCourses';
import { 
  Sparkles, 
  User as UserIcon, 
  Settings, 
  Flame, 
  Clock, 
  Award, 
  Sliders, 
  Save, 
  BookOpen, 
  Cpu,
  Trophy,
  Zap
} from 'lucide-react';

const Profile = () => {
  const { user, completeOnboarding } = useAuth();
  const { courses } = useCourses();

  // Settings State Form
  const [dailyGoal, setDailyGoal] = useState(2);
  const [sessionLength, setSessionLength] = useState(25);
  const [selectedHours, setSelectedHours] = useState([]);
  
  // Notice alert states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize values from user profile context
  useEffect(() => {
    if (user) {
      setDailyGoal(user.dailyStudyGoalHours || 2);
      setSessionLength(user.preferredStudySessionLength || 25);
      setSelectedHours(user.peakHours || ['morning', 'afternoon']);
    }
  }, [user]);

  const handleHourToggle = (hour) => {
    if (selectedHours.includes(hour)) {
      setSelectedHours(prev => prev.filter(h => h !== hour));
    } else {
      setSelectedHours(prev => [...prev, hour]);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsSaving(true);

    if (selectedHours.length === 0) {
      setErrorMsg('Please select at least one peak study time slice.');
      setIsSaving(false);
      return;
    }

    try {
      const res = await completeOnboarding({
        peakHours: selectedHours,
        preferredStudySessionLength: sessionLength,
        dailyStudyGoalHours: dailyGoal
      });

      if (res && res.success) {
        setSuccessMsg('Academic profile settings have been successfully re-tuned and synchronized!');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(res.message || 'Failed to update academic profile parameters.');
      }
    } catch (err) {
      setErrorMsg('Failed to update configurations. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Gamified Level Rank naming
  const getRankName = (lvl) => {
    if (lvl >= 10) return 'Academic Sage Master 🌌';
    if (lvl >= 7) return 'Cognitive Prodigy ⚡';
    if (lvl >= 5) return 'Focused Elite Thinker 🧠';
    if (lvl >= 3) return 'Diligent Scholar 📖';
    return 'Apprentice Scholar 🌱';
  };

  // Progression math
  const currentLvl = user?.level || 1;
  const currentXP = user?.totalXP || 0;
  const nextLvlXP = currentLvl * 500;
  const progressPercent = Math.min(100, Math.round((currentXP / nextLvlXP) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 mb-20 md:mb-0 animate-fade-in">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
        <div>
          <h2 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-white leading-tight">
            Academic Profile Settings
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed mt-1 flex items-center gap-1.5">
            <Settings className="w-4.5 h-4.5 text-brand-500" />
            Audit your gamification metrics and re-tune your cognitive schedule constraints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: GAMIFIED BADGES & ACADEMIC RANK (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Rank Badge Glass Card */}
          <div className="glass-card p-6 text-center space-y-4 relative overflow-hidden">
            {/* Background glowing blob */}
            <div className="absolute w-24 h-24 rounded-full bg-brand-500/10 blur-xl top-0 right-0 pointer-events-none" />
            
            <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/10 flex items-center justify-center mx-auto text-brand-500 shadow-md">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-brand-500 font-extrabold uppercase tracking-widest block">
                {getRankName(currentLvl)}
              </span>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">
                {user?.name || 'Scholar'}
              </h3>
              <p className="text-slate-400 text-xs font-semibold">{user?.email}</p>
            </div>

            {/* XP bar */}
            <div className="space-y-2 pt-2 text-left">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>XP Progress</span>
                <span>{currentXP} / {nextLvlXP} XP (Level {currentLvl})</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-brand-600 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gamification Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Streak day widget */}
            <div className="glass-card p-5 space-y-2.5 relative overflow-hidden flex flex-col justify-between">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center text-orange-500">
                <Flame className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800 dark:text-white">
                  {user?.currentStreak || 0} Days
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Active Study Streak</p>
              </div>
            </div>

            {/* Course subjects widget */}
            <div className="glass-card p-5 space-y-2.5 relative overflow-hidden flex flex-col justify-between">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-500">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800 dark:text-white">
                  {courses.length} Classes
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Enrolled Courses</p>
              </div>
            </div>

          </div>

          {/* Gamified Achievements List */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1">
              Active Achievements
            </h3>
            
            <div className="space-y-2.5">
              
              {/* achievement 1 */}
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#121624]/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-700 dark:text-slate-200">First Steps</h5>
                  <p className="text-[10px] text-slate-400 font-semibold">Completed onboarding setup (+100 XP)</p>
                </div>
              </div>

              {/* achievement 2 */}
              <div className={`flex items-center gap-3 p-3 border rounded-xl ${
                courses.length > 0
                  ? 'bg-white dark:bg-[#121624]/60 border-slate-200/50 dark:border-slate-800/40 opacity-100'
                  : 'border-dashed border-slate-200 dark:border-slate-800/80 opacity-50'
              }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  courses.length > 0 ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-700 dark:text-slate-200">Class Enrolled</h5>
                  <p className="text-[10px] text-slate-400 font-semibold">Added your first course catalog</p>
                </div>
              </div>

              {/* achievement 3 */}
              <div className={`flex items-center gap-3 p-3 border rounded-xl ${
                (user?.currentStreak || 0) >= 3
                  ? 'bg-white dark:bg-[#121624]/60 border-slate-200/50 dark:border-slate-800/40 opacity-100'
                  : 'border-dashed border-slate-200 dark:border-slate-800/80 opacity-50'
              }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  (user?.currentStreak || 0) >= 3 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-700 dark:text-slate-200">Consistency Master</h5>
                  <p className="text-[10px] text-slate-400 font-semibold">Reach a study streak of 3 consecutive days</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PREFERENCES TUNING WORKBENCH (col-span-7) */}
        <div className="lg:col-span-7 glass-card p-5 md:p-6 space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Cognitive Constraints Configuration</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Align AI scheduling logic and dashboard parameters to your habits.</p>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold leading-normal animate-slide-up flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-danger/10 border border-danger/25 text-danger rounded-xl text-xs font-bold leading-normal animate-slide-up">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Daily study goal hours */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-brand-500" />
                  Daily Study Goal
                </label>
                <span className="text-xs font-black text-brand-600 dark:text-brand-400">{dailyGoal} Hours</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.5"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
                disabled={isSaving}
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                <span>0.5h (Min study slot)</span>
                <span>8h (Extreme study goal)</span>
              </div>
            </div>

            {/* Pomodoro study slot length */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-indigo-500" />
                  Target Focus Duration
                </label>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{sessionLength} Minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={sessionLength}
                onChange={(e) => setSessionLength(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                disabled={isSaving}
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                <span>5m (Quick sprint)</span>
                <span>90m (Deep study)</span>
              </div>
            </div>

            {/* Peak Hours Checklist checkboxes */}
            <div className="space-y-3.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4.5 h-4.5 text-brand-500" />
                Peak Focus Energy Slices
              </label>
              
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'morning', label: '🌅 Morning', range: '6:00 AM - 12:00 PM' },
                  { key: 'afternoon', label: '☀️ Afternoon', range: '12:00 PM - 5:00 PM' },
                  { key: 'evening', label: '🌇 Evening', range: '5:00 PM - 9:00 PM' },
                  { key: 'night', label: '🌌 Night', range: '9:00 PM - 2:00 AM' }
                ].map((hourObj) => {
                  const isChecked = selectedHours.includes(hourObj.key);
                  return (
                    <button
                      type="button"
                      key={hourObj.key}
                      onClick={() => handleHourToggle(hourObj.key)}
                      disabled={isSaving}
                      className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-[80px] active:scale-[0.98] transition-all ${
                        isChecked
                          ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-slate-500'
                      }`}
                    >
                      <span className="text-xs font-bold">{hourObj.label}</span>
                      <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{hourObj.range}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full glass-btn-primary py-3 text-xs font-bold rounded-xl shadow-md shadow-brand-600/10 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <Save className="w-4.5 h-4.5" />
              {isSaving ? 'Syncing Configurations...' : 'Save Configuration Settings'}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Profile;
