import React, { useState } from 'react';
import { PlusCircle, Calendar, Clock, AlertTriangle, Sparkles, X } from 'lucide-react';

const TaskForm = ({ courses, onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [difficulty, setDifficulty] = useState('medium');
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Please enter a task title');
    if (!dueDate) return setError('Please choose a due date');
    if (estimatedHours < 0.25) return setError('Estimated time must be at least 15 minutes (0.25h)');

    onSubmit({
      title,
      description,
      course: courseId || undefined,
      dueDate: new Date(dueDate).toISOString(),
      priority,
      difficulty,
      estimatedHours: parseFloat(estimatedHours)
    });

    // Reset fields
    setTitle('');
    setDescription('');
    setCourseId('');
    setDueDate('');
    setPriority('medium');
    setDifficulty('medium');
    setEstimatedHours(1);
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {onClose && (
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
            <PlusCircle className="w-5 h-5 text-brand-500" />
            Add New Study Assignment
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-500 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Assignment Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Write midterm programming lab report"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full glass-input"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Description (Optional)</label>
          <textarea
            placeholder="Outline task topics, goals, and useful links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full glass-input h-18 resize-none"
          />
        </div>

        {/* Course, Priority & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Course select */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Subject Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full glass-input"
            >
              <option value="">General Review</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code || 'GEN'})
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full glass-input"
            >
              <option value="low">🌱 Low</option>
              <option value="medium">⚡ Medium</option>
              <option value="high">🚨 High</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Fatigue Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full glass-input"
            >
              <option value="easy">🌱 Easy Mode</option>
              <option value="medium">⚡ Standard</option>
              <option value="hard">🚨 Hard Mode</option>
            </select>
          </div>
        </div>

        {/* Dates & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Due date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Due Date deadline</label>
            <div className="relative">
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full glass-input pl-10"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Hours Est */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Hours Est. Time</label>
            <div className="relative">
              <input
                type="number"
                step="0.25"
                min="0.25"
                required
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full glass-input pl-10"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full glass-btn-primary flex items-center justify-center gap-2 mt-2"
        >
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          Create Task & Recalculate
        </button>

      </div>
    </form>
  );
};

export default TaskForm;
