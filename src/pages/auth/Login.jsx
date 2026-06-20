import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useLogin } from '../../hooks/useAuth';
import { Sprout, Mail, Lock, Eye, EyeOff, ShieldAlert, Sun, Moon } from 'lucide-react';

export default function Login() {
  const { isAuthenticated, currentUser, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const { mutate: loginMutate, isPending } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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

    loginMutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/sales/pos');
          }
        },
        onError: (err) => {
          setError(err.response?.data?.message || 'Invalid email or password');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left Column: Form Section */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-white dark:bg-slate-900 relative z-10 shadow-2xl shadow-slate-900/10 dark:shadow-black/50">
        
        {/* Top Header & Theme Switcher */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Sprout className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
                AgroChem POS
              </h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest -mt-0.5">
                Staff Terminal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:scale-105 transition-all shadow-sm focus:outline-none cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        {/* Middle Form Area */}
        <div className="max-w-md w-full mx-auto my-auto py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Enter your credentials to access the terminal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setError(''); setEmail(e.target.value); }}
                  placeholder="staff@agrochem.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setError(''); setPassword(e.target.value); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl text-xs text-red-600 dark:text-red-400 font-semibold flex items-center space-x-2.5 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/10 dark:shadow-emerald-500/5 transition-all hover:bg-emerald-500 dark:hover:bg-emerald-400 hover:shadow-emerald-500/20 active:scale-[0.98] flex justify-center items-center cursor-pointer ${
                isPending ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isPending ? (
                <svg className="animate-spin h-5 w-5 text-white dark:text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center lg:text-left text-xs text-slate-400 dark:text-slate-500 mt-6">
          <p>© 2026 AgroChem POS. All rights reserved. v2.0</p>
        </div>
      </div>

      {/* Right Column: Visual Splendor (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900 flex-col justify-between p-16 text-white select-none">
        
        {/* Dynamic high quality background image from Unsplash */}
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80"
          alt="Modern Agriculture Crop Fields"
          className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-700"
        />

        {/* Layered overlays for premium aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/95 via-slate-950/80 to-emerald-950/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />

        {/* Floating top badge */}
        <div className="relative z-10 flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-300">Terminal v2.0 Online</span>
        </div>

        {/* Main hero callout content */}
        <div className="relative z-10 max-w-lg mt-auto">
          <h3 className="text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Simplify inventory,<br />multiply efficiency.
          </h3>
          <p className="text-slate-300 text-sm max-w-md font-medium leading-relaxed mb-8">
            Manage stock levels, complete transactions, and track purchase orders in real-time from our unified merchant interface.
          </p>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors duration-300">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">POS Sales Speed</div>
              <div className="text-lg font-extrabold text-emerald-400">&lt; 1.2s</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors duration-300">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Inventory Sync</div>
              <div className="text-lg font-extrabold text-emerald-400">Real-Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
