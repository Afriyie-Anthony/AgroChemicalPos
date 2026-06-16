import React from 'react';
import { useStore } from '../../store/useStore';
import { AlertCircle, Info, CheckCircle2, X } from 'lucide-react';

export default function AlertModal() {
  const { alertConfig, closeAlert } = useStore();

  if (!alertConfig.isOpen) return null;

  const getIcon = () => {
    switch (alertConfig.type) {
      case 'error': return <AlertCircle className="w-6 h-6 text-rose-500" />;
      case 'warning': return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBgClass = () => {
    switch (alertConfig.type) {
      case 'error': return 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20';
      case 'warning': return 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20';
      case 'success': return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20';
      default: return 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        
        <div className={`p-4 border-b ${getBgClass()} flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            {getIcon()}
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-wide">
              {alertConfig.title || 'System Notice'}
            </h3>
          </div>
          <button 
            onClick={closeAlert}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-center">
          {alertConfig.message}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
          {alertConfig.onConfirm ? (
            <>
              <button
                onClick={closeAlert}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alertConfig.onConfirm();
                  closeAlert();
                }}
                className={`px-4 py-2 font-bold rounded-xl shadow-sm transition-all focus:outline-none ${
                  alertConfig.type === 'error' ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                Confirm
              </button>
            </>
          ) : (
            <button
              onClick={closeAlert}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl shadow-sm transition-all focus:outline-none"
            >
              Acknowledge
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}
