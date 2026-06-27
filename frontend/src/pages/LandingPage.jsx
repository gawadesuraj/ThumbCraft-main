import { useState } from 'react';
import useAuthStore from '../stores/authStore';
import useUIStore from '../stores/uiStore';
import LoginModal from '../components/LoginModal';
import { Sparkles, ArrowRight, Paintbrush, Zap, Shield, Image, Film, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal, isLoginModalOpen, closeLoginModal } = useUIStore();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/workspace');
    } else {
      openLoginModal();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300/20 dark:bg-blue-900/10 rounded-full filter blur-3xl animate-blob" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300/20 dark:bg-purple-900/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            TC
          </div>
          <span className="font-extrabold text-lg tracking-wide bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            ThumbCraft
          </span>
        </div>

        <div>
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/workspace')}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Go to Studio
            </button>
          ) : (
            <button
              onClick={openLoginModal}
              className="px-5 py-2 rounded-xl bg-white/80 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/80 font-semibold text-sm transition-all shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16 md:py-24 text-center flex-grow flex flex-col justify-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-xs font-semibold mb-8 tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 mr-2 text-blue-500" />
          The Portfolio Quality SaaS Application
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Generate High-Converting
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent block mt-2">
            YouTube Thumbnails in Seconds
          </span>
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          Stop wasting hours in Photoshop. Describe your content, choose your aesthetic, and let our multi-model AI abstraction layer create viral-ready drafts.
        </p>

        <div className="flex justify-center space-x-4 mb-16">
          <button
            onClick={handleGetStarted}
            className="flex items-center px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base transition-all duration-200 shadow-xl shadow-blue-500/20 transform hover:-translate-y-0.5 group"
          >
            Start Generating Free
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-10">
          <div className="p-6 bg-white/40 dark:bg-gray-900/30 border border-white/20 dark:border-gray-800/40 rounded-2xl backdrop-blur-md shadow-sm text-left">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-inner">
              <Paintbrush className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Style Control Wizard</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-light">
              Tailor generations by category, primary colors, typography layout overlay, and mood presets to get exactly what you envision.
            </p>
          </div>

          <div className="p-6 bg-white/40 dark:bg-gray-900/30 border border-white/20 dark:border-gray-800/40 rounded-2xl backdrop-blur-md shadow-sm text-left">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Multi-Model Abstraction</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-light">
              Powered by Google Gemini and DALL-E-3. Dynamically selects or queries specific AI image backends without hardcoding.
            </p>
          </div>

          <div className="p-6 bg-white/40 dark:bg-gray-900/30 border border-white/20 dark:border-gray-800/40 rounded-2xl backdrop-blur-md shadow-sm text-left">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Dedicated Workspaces</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-light">
              Organize generations inside projects and directories. Track credits consumption history, and download high resolution outputs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-gray-200/50 dark:border-gray-800/40 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} ThumbCraft. Built for Professional Portfolio. All rights reserved.
      </footer>

      {/* Login modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
}
