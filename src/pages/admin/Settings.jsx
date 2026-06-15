import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Store, 
  Save, 
  CheckCircle,
  User
} from 'lucide-react';

export default function Settings() {
  const { currentUser, updateStaff } = useStore();
  const isAdmin = currentUser?.role === 'admin';

  // Business profile details (local state)
  const [shopName, setShopName] = useState('Nsawam Agro-Chemical Store');
  const [gpsAddress, setGpsAddress] = useState('EN-023-4567');
  const [phone, setPhone] = useState('0244123456');
  const [email, setEmail] = useState('nsawam@agrochempos.com');
  
  // Personal profile details (synced with store)
  const [personalName, setPersonalName] = useState(currentUser?.name || '');
  const [personalPhone, setPersonalPhone] = useState(currentUser?.phone || '');
  const [personalEmail, setPersonalEmail] = useState(currentUser?.email || '');
  const [personalPassword, setPersonalPassword] = useState(currentUser?.password || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentUser) {
      updateStaff(currentUser.id, {
        name: personalName,
        phone: personalPhone,
        email: personalEmail,
        password: personalPassword
      });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Configuration Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {isAdmin 
            ? 'Configure store metadata, business location details, and your personal profile' 
            : 'Configure and update your personal user profile'}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center space-x-2.5 text-xs font-bold animate-in slide-in-from-top duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>Profile and settings changes saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : 'max-w-2xl'} gap-6`}>
          
          {/* Business Profile (Admin Only) */}
          {isAdmin && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-900">
                <Store className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Business Profile Details</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Registered Business Name *</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Ghana Post Digital GPS Address *</label>
                  <input
                    type="text"
                    required
                    value={gpsAddress}
                    onChange={(e) => setGpsAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>


                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Primary Contact Hotline *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-202 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Support Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-202 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Personal Profile Details (Admin and Salesperson) */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-900">
              <User className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Personal Profile Details</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={personalName}
                  onChange={(e) => setPersonalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={personalPhone}
                  onChange={(e) => setPersonalPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-202 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Password *</label>
                <input
                  type="password"
                  required
                  value={personalPassword}
                  onChange={(e) => setPersonalPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-slate-202 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
}
