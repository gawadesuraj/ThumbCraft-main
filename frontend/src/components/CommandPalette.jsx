import { useState } from 'react';
import { Search, Compass, Terminal, Shield, Moon, Sun, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShortcuts } from '../context/ShortcutsContext';
import { useTheme } from '../context/ThemeContext';

export default function CommandPalette() {
  const { isPaletteOpen, closePalette } = useShortcuts();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  if (!isPaletteOpen) return null;

  const actions = [
    { id: '1', title: 'Go to Dashboard', shortcut: 'Alt + D', action: () => navigate('/') },
    { id: '2', title: 'Open ThumbCraft Studio', shortcut: 'Alt + G', action: () => navigate('/workspace') },
    { id: '3', title: 'Usage Analytics & Credits', shortcut: 'Alt + A', action: () => navigate('/analytics') },
    { id: '4', title: 'Thumbnail History', shortcut: 'Alt + H', action: () => navigate('/history') },
    { id: '5', title: 'Toggle Dark / Light Mode', shortcut: 'Alt + T', action: toggleTheme },
    { id: '6', title: 'Close Palette', shortcut: 'Esc', action: closePalette },
  ];

  const filteredActions = actions.filter(action =>
    action.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-gray-950/40 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-800/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200/50 dark:border-gray-800/30">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none text-base"
            placeholder="Type a command or search..."
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={closePalette} className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-lg">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredActions.length > 0 ? (
            filteredActions.map(action => (
              <button
                key={action.id}
                onClick={() => {
                  action.action();
                  closePalette();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-xl transition-all duration-150 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white text-gray-700 dark:text-gray-300 group"
              >
                <div className="flex items-center">
                  <Compass className="w-4.5 h-4.5 mr-3 text-gray-400 group-hover:text-white" />
                  <span className="font-medium text-sm">{action.title}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-200/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 group-hover:bg-white/20 group-hover:text-white transition-colors font-mono">
                  {action.shortcut}
                </span>
              </button>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-gray-400">
              No commands found matching "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-100/50 dark:bg-gray-950/20 border-t border-gray-200/50 dark:border-gray-800/30 flex justify-between items-center text-xs text-gray-400 font-mono">
          <span>Tip: Use Ctrl + K to toggle anywhere</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
