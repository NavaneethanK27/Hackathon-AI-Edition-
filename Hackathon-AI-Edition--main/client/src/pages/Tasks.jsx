import React, { useState } from 'react';
import useTasks from '../hooks/useTasks';
import useCourses from '../hooks/useCourses';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { 
  Sparkles, 
  ListTodo, 
  Filter, 
  CheckSquare, 
  BookOpen,
  Award,
  AlertCircle,
  Plus
} from 'lucide-react';

const Tasks = () => {
  const { tasks, loading, addTask, toggleSubtask, updateTask, deleteTask, breakdownTaskWithAI } = useTasks();
  const { courses } = useCourses();

  // State filters
  const [statusFilter, setStatusFilter] = useState('todo'); // todo, completed, all
  const [priorityFilter, setPriorityFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggleTaskComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    await updateTask(task._id, { status: nextStatus });
  };

  const handleAddTask = async (taskData) => {
    await addTask(taskData);
    setShowAddForm(false);
  };

  // Filter computation
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === 'todo' && task.status === 'completed') return false;
    if (statusFilter === 'completed' && task.status !== 'completed') return false;
    
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (courseFilter && task.course?._id !== courseFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 mb-20 md:mb-0">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
        <div>
          <h2 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-white leading-tight">
            Academic Assignments Workspace
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed mt-1 flex items-center gap-1.5">
            <ListTodo className="w-4.5 h-4.5 text-brand-500" />
            Manage coursework, prioritize deadlines, and break down complex chapters with AI.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="glass-btn-primary py-2.5 px-5 text-xs font-bold rounded-xl active:scale-95 flex items-center gap-1.5 shadow-md shadow-brand-600/10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Study Task
        </button>
      </div>

      {/* EXPANDABLE ADD TASK PANEL */}
      {showAddForm && (
        <div className="glass-card p-6 border-brand-500/25 bg-brand-500/5 dark:bg-brand-500/10 shadow-lg animate-slide-up">
          <TaskForm 
            courses={courses} 
            onSubmit={handleAddTask} 
            onClose={() => setShowAddForm(false)} 
          />
        </div>
      )}

      {/* FILTERBAR ROW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#121624]/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
        
        {/* Status Tab buttons */}
        <div className="flex gap-1.5 border-b lg:border-none border-slate-100 dark:border-slate-800 pb-3 lg:pb-0">
          {[
            { key: 'todo', label: 'Pending Assignments' },
            { key: 'completed', label: 'Completed' },
            { key: 'all', label: 'All Tasks' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/15'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters select grids */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters:</span>
          </div>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="glass-input py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/50 font-semibold"
          >
            <option value="">All Subjects</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="glass-input py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/50 font-semibold"
          >
            <option value="">All Priorities</option>
            <option value="high">🚨 High Priority</option>
            <option value="medium">⚡ Medium</option>
            <option value="low">🌱 Low</option>
          </select>
        </div>

      </div>

      {/* DETAILED ASSIGNMENTS LIST GRID */}
      {loading ? (
        <div className="py-20 text-center animate-pulse text-xs text-slate-400 font-bold uppercase">
          Contacting Academic server databases...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card py-16 px-4 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900/60 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-200/50 dark:border-slate-800/40">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">No matching study tasks found</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
              Add new assignments or adjust your status/priority filters to see other tasks.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3.5 max-w-4xl mx-auto">
          {filteredTasks.map((task) => (
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
  );
};

export default Tasks;
