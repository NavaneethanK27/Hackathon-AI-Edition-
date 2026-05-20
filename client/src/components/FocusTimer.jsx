import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Award, CheckCircle, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const FocusTimer = ({ activeBlock, onSessionCompleted }) => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins base
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  
  // Modal states
  const [focusScore, setFocusScore] = useState(80);
  const [distractions, setDistractions] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [xpReward, setXpReward] = useState(null);

  const timerRef = useRef(null);

  // Sync with user preference
  useEffect(() => {
    if (user && user.preferredStudySessionLength && !isActive) {
      setTimeLeft(user.preferredStudySessionLength * 60);
    }
  }, [user, isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerCompletion();
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleTimerCompletion = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    
    // Play HTML5 beep audio cues safely
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // 600Hz
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5); // beep 0.5s
    } catch (e) {
      console.log('Audio Context beep bypassed due to browser policy');
    }

    if (!isBreak) {
      // Focus session ended, ask to log score
      setShowLogModal(true);
    } else {
      // Break ended
      alert('🌸 Rest break completed! Ready to get back into study?');
      setIsBreak(false);
      setTimeLeft((user?.preferredStudySessionLength || 25) * 60);
    }
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setIsBreak(false);
    setTimeLeft((user?.preferredStudySessionLength || 25) * 60);
  };

  const skipTimer = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setTimeLeft(0);
    handleTimerCompletion();
  };

  const toggleBreakMode = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    const nextBreakState = !isBreak;
    setIsBreak(nextBreakState);
    setTimeLeft(nextBreakState ? 5 * 60 : (user?.preferredStudySessionLength || 25) * 60); // 5 mins break
  };

  const submitFocusScore = async () => {
    setIsSubmitting(true);
    try {
      // If we have an active StudyBlock, log it. Otherwise we create a generic placeholder study block first
      let targetBlockId = activeBlock?._id;

      if (!targetBlockId) {
        // Create generic study block to log focus session against
        const genericRes = await API.post('/schedule/blocks', {
          title: '🔥 Custom Pomodoro Session',
          startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          notes: 'Focus session completed using the Pomodoro widget.',
          isBreak: false
        });
        if (genericRes.data && genericRes.data.success) {
          targetBlockId = genericRes.data.block._id;
        }
      }

      const logRes = await API.post(`/schedule/blocks/${targetBlockId}/focus`, {
        focusScore,
        distractionCount: distractions,
        studyDurationMinutes: user?.preferredStudySessionLength || 25
      });

      if (logRes.data && logRes.data.success) {
        setXpReward(logRes.data.xpGained);
        setTimeout(() => {
          setShowLogModal(false);
          setXpReward(null);
          if (onSessionCompleted) onSessionCompleted();
          // Reset timer
          setIsBreak(true); // Auto shift to break
          setTimeLeft(5 * 60); // Set 5 min rest timer
        }, 2200);
      }
    } catch (err) {
      console.error('Failed to log focus score:', err);
      alert('Failed to log focus score to database. Experience points still earned in spirit!');
      setShowLogModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = isBreak
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : (((user?.preferredStudySessionLength || 25) * 60 - timeLeft) / ((user?.preferredStudySessionLength || 25) * 60)) * 100;

  return (
    <div className="glass-card pomodoro-glow p-6 text-center relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
      
      {/* Background radial gradient indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 ${isBreak ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${progressPercentage}%` }} />

      <div className="mb-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isBreak 
            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
            : 'bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          {isBreak ? 'Wellness Rest Pacing' : 'Focused Deep Learning'}
        </span>
        <h2 className="text-xl font-bold mt-2.5 text-slate-800 dark:text-slate-100">
          {activeBlock ? activeBlock.title : 'General Focus Session'}
        </h2>
      </div>

      {/* Clock display */}
      <div className="my-3 select-none">
        <span className="font-extrabold text-6xl md:text-7xl tracking-tighter text-slate-800 dark:text-white tabular-nums drop-shadow-sm">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleReset}
          className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 hover:bg-slate-200 hover:text-brand-500 text-slate-600 dark:text-slate-400 active:scale-95 transition-all"
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={handleStartPause}
          className={`p-4.5 rounded-2xl text-white font-bold shadow-lg active:scale-95 transition-all ${
            isActive
              ? 'bg-slate-800 dark:bg-slate-150 hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-slate-500/10'
              : isBreak
                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25'
                : 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/25'
          }`}
        >
          {isActive ? <Pause className="w-6.5 h-6.5 fill-current" /> : <Play className="w-6.5 h-6.5 fill-current" />}
        </button>

        <button
          onClick={skipTimer}
          className="px-4.5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 hover:bg-slate-200 hover:text-brand-500 text-slate-600 dark:text-slate-400 font-semibold text-xs active:scale-95 transition-all"
        >
          Skip
        </button>
      </div>

      {/* Break toggle button */}
      <div className="mt-4">
        <button
          onClick={toggleBreakMode}
          className="text-xs font-semibold text-slate-400 hover:text-brand-500 transition-colors"
        >
          Switch to {isBreak ? 'Study Mode (25m)' : 'Break Mode (5m)'}
        </button>
      </div>

      {/* FOCUS SCORE LOGGING MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121624] border border-slate-200 dark:border-slate-800/80 w-full max-w-md rounded-3xl p-6 text-left shadow-2xl animate-slide-up relative overflow-hidden">
            
            {xpReward && (
              <div className="absolute inset-0 bg-brand-600 flex flex-col items-center justify-center text-white text-center p-6 z-10 animate-fade-in">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white mb-4 animate-bounce">
                  <Award className="w-10 h-10 stroke-[2.5]" />
                </div>
                <h3 className="font-extrabold text-2xl">Awesome Concentration!</h3>
                <p className="text-brand-100 font-medium text-sm mt-1">Focus logged successfully</p>
                <div className="bg-white text-brand-700 px-5 py-2.5 rounded-2xl font-black text-xl shadow-lg mt-5">
                  +{xpReward} XP Earned
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center text-brand-500">
                <CheckCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Session Completed!</h3>
                <p className="text-slate-400 text-xs font-medium">Log focus scores to claim gamified XP</p>
              </div>
            </div>

            {/* Slider Focus Quality */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Focus Score Intensity</label>
                <span className="text-sm font-black text-brand-500">{focusScore}/100</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={focusScore}
                onChange={(e) => setFocusScore(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1.5 uppercase">
                <span>Distracted</span>
                <span>Moderate</span>
                <span>Flow State</span>
              </div>
            </div>

            {/* Distraction Tally */}
            <div className="mb-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Distraction Count</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Tally text/notification disruptions</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDistractions(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-300 active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-base dark:text-white">{distractions}</span>
                  <button
                    onClick={() => setDistractions(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-300 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {distractions > 3 && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-2 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>High distractions logged. We recommend muting notifications in the next study block!</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={submitFocusScore}
              disabled={isSubmitting}
              className="w-full glass-btn bg-brand-600 text-white font-bold rounded-xl py-3 shadow-lg hover:bg-brand-500 shadow-brand-600/15 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Syncing Cognitive Data...' : 'Save & Claim Experience'}
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default FocusTimer;
