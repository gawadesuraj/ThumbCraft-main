import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import useUIStore from '../stores/uiStore';

export default function Toast() {
  const { toast, hideToast } = useUIStore();

  useEffect(() => {
    if (toast.show && toast.autoHide) {
      const timer = setTimeout(() => {
        hideToast();
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, toast.autoHide, toast.duration, hideToast]);

  if (!toast.show) return null;

  const config = {
    success: {
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/80 border-emerald-200/50 dark:border-emerald-800/30',
      text: 'text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
    },
    error: {
      bg: 'bg-rose-50/90 dark:bg-rose-950/80 border-rose-200/50 dark:border-rose-800/30',
      text: 'text-rose-800 dark:text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />
    },
    warning: {
      bg: 'bg-amber-50/90 dark:bg-amber-950/80 border-amber-200/50 dark:border-amber-800/30',
      text: 'text-amber-800 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
    },
    info: {
      bg: 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-200/50 dark:border-blue-800/30',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-500" />
    }
  };

  const style = config[toast.type] || config.info;

  return (
    <div className="fixed top-5 right-5 z-[999] max-w-sm w-full px-4 animate-slide-in">
      <div className={`flex items-start p-4 border rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 ${style.bg}`}>
        <div className="flex-shrink-0 mr-3 mt-0.5">{style.icon}</div>
        <div className="flex-grow">
          {toast.title && (
            <h4 className={`font-semibold text-sm mb-1 ${style.text}`}>{toast.title}</h4>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={hideToast}
          className="flex-shrink-0 ml-3 p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
