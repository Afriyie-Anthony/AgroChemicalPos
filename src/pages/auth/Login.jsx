import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Sprout, Mail, Lock, Eye, EyeOff, ShieldAlert, Sun, Moon } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated, currentUser, theme, toggleTheme } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/sales/pos');
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in both Email and Password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/sales/pos');
        }
      } else {
        setError(result.message || 'Invalid email or password');
      }
    }, 600);
  };

  const autofillDemo = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('kwame@agrochem.com');
      setPassword('admin123');
    } else {
      setEmail('rita@agrochem.com');
      setPassword('sales123');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-slate-100 via-slate-200 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 text-slate-800 dark:text-slate-100 p-4 transition-colors duration-200 relative">
      
      {/* Floating Theme Switcher */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all shadow-md focus:outline-none cursor-pointer"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
      </button>

      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-4 shadow-xl shadow-emerald-900/5 dark:shadow-emerald-900/10">
          <Sprout className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
          AgroChem POS
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wide mt-1 uppercase">
          Point of Sale & Inventory Management
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/65 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 animate-in fade-in duration-150">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Staff Portal</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">Enter your credentials to access the terminal.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setError(''); setEmail(e.target.value); }}
                placeholder="staff@agrochem.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => { setError(''); setPassword(e.target.value); }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-600 dark:text-red-405 font-semibold animate-pulse flex items-center space-x-2">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/5 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/20 active:scale-98 flex justify-center items-center cursor-pointer ${
              loading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              'LOGIN TERMINAL'
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Click */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">
            Quick Autofill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => autofillDemo('admin')}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all text-center shadow-sm cursor-pointer"
            >
              Manager Account
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('sales')}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-xl text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-all text-center shadow-sm cursor-pointer"
            >
              Cashier Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
