import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

const ShortcutsContext = createContext();

export function ShortcutsProvider({ children }) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const togglePalette = () => setIsPaletteOpen(prev => !prev);
  const closePalette = () => setIsPaletteOpen(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Command Palette: Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePalette();
      }

      // Navigate to Dashboard: Alt + D
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        navigate('/');
        closePalette();
      }

      // Navigate to Workspace/Generator: Alt + g
      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        navigate('/workspace');
        closePalette();
      }

      // Navigate to History: Alt + h
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        navigate('/history');
        closePalette();
      }

      // Navigate to Analytics: Alt + a
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate('/analytics');
        closePalette();
      }

      // Toggle Theme: Alt + t
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheme();
      }

      // Close Palette: Escape
      if (e.key === 'Escape') {
        closePalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toggleTheme]);

  return (
    <ShortcutsContext.Provider value={{ isPaletteOpen, togglePalette, closePalette }}>
      {children}
    </ShortcutsContext.Provider>
  );
}

export function useShortcuts() {
  const context = useContext(ShortcutsContext);
  if (!context) throw new Error('useShortcuts must be used within a ShortcutsProvider');
  return context;
}
