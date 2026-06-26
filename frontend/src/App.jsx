import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { ShortcutsProvider } from './context/ShortcutsContext';

// Layout and UI Global Components
import DashboardLayout from './components/DashboardLayout';
import Toast from './components/Toast';
import CommandPalette from './components/CommandPalette';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import HistoryPage from './pages/HistoryPage';
import Analytics from './pages/Analytics';

export default function App() {
  const { init, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Restore authorization token from local storage
    init();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <ShortcutsProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
            
            {isAuthenticated ? (
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/workspace" element={<Workspace />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/analytics" element={<Analytics />} />
                  {/* Fallback to dashboard */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Routes>
                <Route path="/" element={<LandingPage />} />
                {/* Redirect unauthenticated requests back to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}

            {/* Floating Toast Alerts */}
            <Toast />

            {/* Quick Command Palette */}
            <CommandPalette />
            
          </div>
        </ShortcutsProvider>
      </Router>
    </ThemeProvider>
  );
}