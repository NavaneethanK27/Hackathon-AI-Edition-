import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useSchedule from '../hooks/useSchedule';
import useTasks from '../hooks/useTasks';
import useAI from '../hooks/useAI';

import StreakBadge from '../components/StreakBadge';
import XPBar from '../components/XPBar';
import BurnoutAlert from '../components/BurnoutAlert';
import FocusTimer from '../components/FocusTimer';
import StudyBlockCard from '../components/StudyBlockCard';
import TaskCard from '../components/TaskCard';

import { Sparkles, Calendar, BookOpen, Clock, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { blocks, loading: schedLoading, refreshSchedule, logFocusSession } = useSchedule();
  const { tasks, loading: tasksLoading, toggleSubtask, updateTask, deleteTask, breakdownTaskWithAI } = useTasks();
  const { checkBurnoutRisk } = useAI();
  const navigate = useNavigate();

  // On mount states
  const [burnoutRisk, setBurnoutRisk] = useState(null);
  const [activeStudyBlock, setActiveStudyBlock] = useState(null);
  const [activeTimerBlock, setActiveTimerBlock] = useState(null);

  const fetchBurnoutState = async () => {
    try {
      const risk = await checkBurnoutRisk();
      if (risk && risk.success) {
        setBurnoutRisk(risk);
      }
    } catch (e) {
      console.log('Failed to fetch burnout rating:', e.message);
    }
  };

  useEffect(() => {
    fetchBurnoutState();
  }, []);

  // Identify next scheduled study block that is NOT break and NOT completed
  useEffect(() => {
    const now = new Date();
    const nextUp = blocks
      .filter((b) => !b.isBreak && b.status === 'scheduled' && new Date(b.endTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
    
    setActiveStudyBlock(nextUp || null);
  }, [blocks]);

  const handleStartStudy = (block) => {
    setActiveTimerBlock(block);
  };

  const handleFocusSessionDone = () => {
    setActiveTimerBlock(null);
    refreshSchedule();
    fetchBurnoutState();
  };

  const handleToggleTaskComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    await updateTask(task._id, { status: nextStatus });
  };

  // Remaining blocks for today
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayRemainingBlocks = blocks.filter(
    (b) => new Date(b.startTime) <= todayEnd && b.status === 'scheduled'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 mb-20 md:mb-0">
      
      {/* HEADER SECTION WITH USER GREETINGS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
        <div>
          <h2 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-white leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">{user?.name || 'Scholar'}</span>! 👋
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed mt-1 flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-brand-500 fill-current/15" />
            "Every focus block you complete is another brick in your wall of knowledge."
          </p>
        </div>

        {/* Short info row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/schedule')}
            className="glass-btn-secondary py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95"
          >
            <Calendar className="w-4.5 h-4.5" />
            Calendar View
          </button>
        </div>
      </div>

      {/* DETAILED STATISTICS & ALERTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        <StreakBadge streak={user?.currentStreak} />
        <XPBar level={user?.level} xp={user?.totalXP} />
        {burnoutRisk ? (
          <BurnoutAlert 
            score={burnoutRisk.burnoutScore} 
            level={burnoutRisk.level} 
            analysis={burnoutRisk.analysis}
            recommendations={burnoutRisk.recommendations}
            onRescheduled={() => {
              refreshSchedule();
              fetchBurnoutState();
            }}
          />
        ) : (
          <div className="glass-card p-5 animate-pulse flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-400">Loading stress index logs...</span>
          </div>
        )}
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACTIVE CLOCK & TARGET SESSIONS (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Pomodoro focus countdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-brand-500" />
                Active Focus Workspace
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Pomodoro Clock
              </span>
            </div>
            
            <FocusTimer 
              activeBlock={activeTimerBlock || activeStudyBlock} 
              onSessionCompleted={handleFocusSessionDone}
            />
          </div>

          {/* Next Up studying block preview */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm pl-1">
              Up Next Scheduled Study Session
            </h3>
            <StudyBlockCard 
              block={activeStudyBlock} 
              onStartTimer={handleStartStudy}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: QUICK TASKS & DAILY EVENTS LIST (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* High priority tasks panel */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Pending Academic Assignments</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">High & medium priority actions</p>
              </div>
              <button 
                onClick={() => navigate('/tasks')}
                className="text-xs text-brand-500 font-black hover:text-brand-600 flex items-center gap-0.5"
              >
                All Tasks
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {tasksLoading ? (
              <div className="py-10 text-center animate-pulse text-xs text-slate-400 font-semibold">
                Retrieving academic tasks...
              </div>
            ) : tasks.filter(t => t.status !== 'completed').length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-bold uppercase bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
                🚀 Flawless clearance! No pending tasks.
              </div>
            ) : (
              <div className="grid gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {tasks
                  .filter((t) => t.status !== 'completed')
                  .slice(0, 3)
                  .map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggleComplete={handleToggleTaskComplete}
                      onToggleSubtask={toggleSubtask}
                      onBreakdownAI={breakdownTaskWithAI}
                      onDelete={deleteTask}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Today's Remaining Schedule Blocks */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 font-sans">Remaining Slots (Today)</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Focus blocks and wellness breaks</p>
              </div>
              <button 
                onClick={() => navigate('/schedule')}
                className="text-xs text-brand-500 font-black hover:text-brand-600 flex items-center gap-0.5"
              >
                Planner
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {schedLoading ? (
              <div className="py-8 text-center animate-pulse text-xs text-slate-400 font-semibold">
                Fetching today's schedule...
              </div>
            ) : todayRemainingBlocks.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-bold uppercase bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
                📅 All study blocks logged or cleared!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {todayRemainingBlocks.map((block) => (
                  <div key={block._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#121624]/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-200 truncate">{block.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(block.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        {block.isBreak && ' • Break'}
                      </p>
                    </div>
                    
                    {!block.isBreak && (
                      <button
                        onClick={() => handleStartStudy(block)}
                        className="p-1 text-xs text-brand-500 font-black hover:bg-brand-500/10 rounded-lg shrink-0"
                      >
                        Study
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
