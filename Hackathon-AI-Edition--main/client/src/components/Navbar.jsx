import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  User as UserIcon, 
  LogOut, 
  Flame, 
  Moon, 
  Sun,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = React.useState(true);

  const toggleDarkMode = () => {
    setDark(!dark);
    if (dark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'AI Assistant', path: '/ai-assistant', icon: MessageSquare },
    { name: 'Quizzes', path: '/quizzes', icon: BookOpen },
    { name: 'Profile', path: '/profile', icon: UserIcon }
  ];

  if (!user) return null;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white/70 dark:bg-[#0c0e17]/85 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/40 p-5 z-25 text-slate-700 dark:text-slate-200 transition-all duration-300">
        
        {/* LOGO */}
        <div className="flex items-center gap-2.5 px-2 py-4 mb-6 select-none cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5.5 h-5.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent leading-none">StudyFlow</h1>
            <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">Academic AI</span>
          </div>
        </div>

        {/* LEVEL/STREAK WIDGET */}
        <div className="bg-slate-100/60 dark:bg-[#151928]/60 border border-slate-200/50 dark:border-slate-800/30 rounded-2xl p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-500 animate-pulse-subtle">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase leading-none">Active Streak</p>
              <p className="text-sm font-bold text-slate-800 dark:text-orange-400">{user.currentStreak} Days</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-brand-500/10 dark:bg-brand-500/20 px-2.5 py-1 rounded-lg border border-brand-500/10">
            <Award className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-black text-brand-600 dark:text-brand-400">Lvl {user.level}</span>
          </div>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* BOTTOM UTILITY ACTIONS */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/40 pt-4 space-y-1">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-brand-500 dark:hover:text-slate-100 transition-all duration-200"
          >
            <div className="flex items-center gap-3.5">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ${dark ? 'bg-brand-500' : 'bg-slate-300'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${dark ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION (375px responsive screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#0c0e17]/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/40 px-4 py-2 flex items-center justify-around z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-brand-500 scale-105'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name.split(' ')[0]}</span>
            </NavLink>
          );
        })}
        {/* Sign Out on mobile available through profile or simply click */}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] text-rose-500 font-semibold active:scale-95"
        >
          <LogOut className="w-5 h-5 mb-0.5" />
          <span>Exit</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;
