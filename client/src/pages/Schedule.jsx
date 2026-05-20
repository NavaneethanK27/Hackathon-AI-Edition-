import React, { useState } from 'react';
import useSchedule from '../hooks/useSchedule';
import useCourses from '../hooks/useCourses';
import WeeklyCalendar from '../components/WeeklyCalendar';

import { Calendar, Sparkles, Clock, BookOpen, AlertCircle, Plus, X, PlusCircle } from 'lucide-react';

const Schedule = () => {
  const { blocks, loading, generateAISchedule, addStudyBlock, updateStudyBlock, deleteStudyBlock } = useSchedule();
  const { courses } = useCourses();

  // Manual block states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [courseId, setCourseId] = useState('');
  const [isBreak, setIsBreak] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAIScheduleOptimize = async () => {
    if (confirm('Re-balance your weekly study calendar? This will replace upcoming uncompleted study blocks with AI-optimized slots.')) {
      await generateAISchedule();
    }
  };

  const handleManualAddBlock = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!title.trim() || !date || !startTime || !endTime) {
      setIsSubmitting(false);
      return setError('Please fill in title, date, and time blocks.');
    }

    const startISO = new Date(`${date}T${startTime}`).toISOString();
    const endISO = new Date(`${date}T${endTime}`).toISOString();

    if (new Date(endISO) <= new Date(startISO)) {
      setIsSubmitting(false);
      return setError('End time must be after the start time.');
    }

    try {
      const result = await addStudyBlock({
        title,
        startTime: startISO,
        endTime: endISO,
        course: courseId || undefined,
        isBreak,
        notes
      });

      if (result && result.success) {
        setShowAddForm(false);
        // Reset manual form fields
        setTitle('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setCourseId('');
        setIsBreak(false);
        setNotes('');
      } else {
        setError(result?.message || 'Failed to create study block.');
      }
    } catch (err) {
      setError('An error occurred during calendar creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 mb-20 md:mb-0">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
        <div>
          <h2 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-white leading-tight">
            Study Planner Calendar
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed mt-1 flex items-center gap-1.5">
            <Calendar className="w-4.5 h-4.5 text-brand-500" />
            Plan focus intervals, review past focus stats, and let AI balance your week.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="glass-btn-secondary py-2.5 px-4.5 text-xs font-bold rounded-xl active:scale-95 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-slate-400" />
            Schedule Manually
          </button>
          
          <button
            onClick={handleAIScheduleOptimize}
            className="glass-btn bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-brand-600/10 flex items-center gap-1.5 active:scale-95 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-4.5 h-4.5 fill-current animate-pulse text-white" />
            AI Optimize Calendar
          </button>
        </div>
      </div>

      {/* EXPANDABLE MANUAL BLOCK CREATOR PANEL */}
      {showAddForm && (
        <div className="glass-card p-6 border-slate-200/60 dark:border-slate-800/60 shadow-lg animate-slide-up max-w-2xl mx-auto">
          <form onSubmit={handleManualAddBlock} className="space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4.5 h-4.5 text-brand-500" />
                Schedule Custom Study Block
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-500 px-3.5 py-2.5 rounded-xl text-xs font-semibold animate-fade-in">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-4">
              
              {/* Title & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Block Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Read Bio Chapter 2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Highlight key terms and review diagrams..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              {/* Date & Course & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Subject Course</label>
                  <select
                    value={courseId}
                    disabled={isBreak}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full glass-input disabled:opacity-50"
                  >
                    <option value="">General Review</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Block Type</label>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsBreak(false); setCourseId(''); }}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        !isBreak 
                          ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900' 
                          : 'bg-white dark:bg-[#121624] border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      Study
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsBreak(true); setCourseId(''); }}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        isBreak 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                          : 'bg-white dark:bg-[#121624] border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      Break
                    </button>
                  </div>
                </div>
              </div>

              {/* Time inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full glass-btn-primary flex items-center justify-center gap-2 mt-2 font-bold text-xs py-3"
              >
                Schedule Block
              </button>

            </div>
          </form>
        </div>
      )}

      {/* MAIN ADAPTIVE CALENDAR GRID */}
      {loading ? (
        <div className="py-20 text-center animate-pulse text-xs text-slate-400 font-bold uppercase">
          Querying study schedules...
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <WeeklyCalendar 
            blocks={blocks} 
            onDeleteBlock={deleteStudyBlock}
          />
        </div>
      )}

    </div>
  );
};

export default Schedule;
