import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sparkles, History, BarChart3, Moon, Sun, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useTheme } from '../context/ThemeContext';
import { useShortcuts } from '../context/ShortcutsContext';
import client from '../api/client';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const { togglePalette } = useShortcuts();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState(user ? user.credits : 50);

  // Sync remaining user credits from the backend
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await client.get('/api/profile');
          if (res.data && res.data.user) {
            setCredits(res.data.user.credits);
          }
        }
      } catch (err) {
        console.warn('Could not sync credits:', err.message);
      }
    };
    fetchCredits();
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Studio Generator', path: '/workspace', icon: <Sparkles className="w-5 h-5" /> },
    { name: 'Analytics & Credits', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Thumbnail Gallery', path: '/history', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/40 backdrop-blur-md md:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            S
          </div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Thumbnail Studio
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-white/60 dark:bg-gray-900/60 border-r border-gray-200/50 dark:border-gray-800/40 backdrop-blur-xl transition-transform duration-300 transform md:transform-none flex flex-col justify-between ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          {/* Logo */}
          <div className="p-6 hidden md:flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/10">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Thumbnail Studio
              </span>
              <span className="text-[10px] text-gray-400 font-mono">v1.0 Portfolio</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 md:py-2 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <span className="mr-3 transition-transform group-hover:scale-110">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Block & Settings */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/40 space-y-3">
          {/* Credits Box */}
          <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-blue-100/30 dark:border-indigo-900/30 rounded-xl">
            <div className="flex justify-between items-center text-xs font-semibold mb-1 text-blue-700 dark:text-blue-400">
              <span>Studio Credits</span>
              <span>{credits} left</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (credits / 50) * 100)}%` }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            {/* Quick Palette Button */}
            <button
              onClick={togglePalette}
              className="text-xs font-mono text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Ctrl+K palette
            </button>

            {/* Light/Dark Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100/55 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* User profile */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-100/30 dark:bg-gray-800/10 border border-gray-200/30 dark:border-gray-800/30">
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs truncate">{user ? user.name : 'Studio Artist'}</span>
              <span className="text-[10px] text-gray-400 truncate">{user ? user.email : 'guest@studio.com'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Body */}
      <main className="flex-grow pt-16 md:pt-0 p-6 md:p-10 max-w-7xl mx-auto overflow-hidden">
        {children}
      </main>
    </div>
  );
}
