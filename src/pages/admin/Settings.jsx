import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import { useUpdateProfile, useChangePassword } from '../../hooks/useAuth';
import { Store, Save, CheckCircle, User, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function Settings() {
  const { currentUser, setCurrentUser } = useStore();
  const isAdmin = currentUser?.role === 'admin';

  // ── Business Settings ──────────────────────────────────
  const { data: bizData, isLoading: bizLoading } = useSettings();
  const { mutate: saveBiz, isPending: savingBiz } = useUpdateSettings();

  const [shopName, setShopName]       = useState('');
  const [gpsAddress, setGpsAddress]   = useState('');
  const [bizPhone, setBizPhone]       = useState('');
  const [bizEmail, setBizEmail]       = useState('');
  const [taxRate, setTaxRate]         = useState(0);
  const [currency, setCurrency]       = useState('GHS');
  const [receiptFooter, setReceiptFooter] = useState('');

  useEffect(() => {
    if (bizData) {
      setShopName(bizData.shopName || '');
      setGpsAddress(bizData.gpsAddress || '');
      setBizPhone(bizData.phone || '');
      setBizEmail(bizData.email || '');
      setTaxRate(bizData.taxRate || 0);
      setCurrency(bizData.currency || 'GHS');
      setReceiptFooter(bizData.receiptFooter || '');
    }
  }, [bizData]);

  const [bizSuccess, setBizSuccess] = useState('');
  const [bizError, setBizError]     = useState('');

  const handleBizSubmit = (e) => {
    e.preventDefault();
    setBizError('');
    saveBiz(
      { shopName, gpsAddress, phone: bizPhone, email: bizEmail, taxRate, currency, receiptFooter },
      {
        onSuccess: () => { setBizSuccess('Business settings saved!'); setTimeout(() => setBizSuccess(''), 3000); },
        onError: (err) => setBizError(err.response?.data?.message || 'Failed to save settings'),
      }
    );
  };

  // ── Personal Profile ───────────────────────────────────
  const { mutate: saveProfile, isPending: savingProfile } = useUpdateProfile();
  const [personalName, setPersonalName]   = useState(currentUser?.name || '');
  const [personalPhone, setPersonalPhone] = useState(currentUser?.phone || '');
  const [personalEmail, setPersonalEmail] = useState(currentUser?.email || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError]     = useState('');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError('');
    saveProfile(
      { name: personalName, phone: personalPhone, email: personalEmail },
      {
        onSuccess: (data) => {
          setCurrentUser(data.user);
          setProfileSuccess('Profile updated!');
          setTimeout(() => setProfileSuccess(''), 3000);
        },
        onError: (err) => setProfileError(err.response?.data?.message || 'Failed to update profile'),
      }
    );
  };

  // ── Change Password ────────────────────────────────────
  const { mutate: savePassword, isPending: savingPassword } = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError]     = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwError('');
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    savePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPwSuccess('Password changed!');
          setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
          setTimeout(() => setPwSuccess(''), 3000);
        },
        onError: (err) => setPwError(err.response?.data?.message || 'Failed to change password'),
      }
    );
  };

  const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors';
  const labelCls = 'block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5';

  const Alert = ({ type, message }) => (
    <div className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-top duration-200 ${
      type === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span>{message}</span>
    </div>
  );

  const Card = ({ icon: Icon, title, children, onSubmit, isPending, saveLabel = 'Save Changes', success, error }) => (
    <form onSubmit={onSubmit} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-5">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-900">
        <Icon className="w-5 h-5 text-emerald-500" />
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      <div className="space-y-4 text-xs">{children}</div>
      {success && <Alert type="success" message={success} />}
      {error   && <Alert type="error"   message={error} />}
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saveLabel}</span>
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Configuration Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          {isAdmin ? 'Configure store metadata, business location details, and your personal profile' : 'Update your personal profile and account password'}
        </p>
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-2' : 'max-w-2xl'} gap-6`}>

        {/* ── Business Settings (Admin only) ── */}
        {isAdmin && (
          <Card icon={Store} title="Business Profile" onSubmit={handleBizSubmit} isPending={savingBiz} success={bizSuccess} error={bizError}>
            {bizLoading ? (
              <div className="flex items-center space-x-2 text-slate-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading settings...</span>
              </div>
            ) : (
              <>
                <div>
                  <label className={labelCls}>Registered Business Name *</label>
                  <input required value={shopName} onChange={(e) => setShopName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Ghana Post GPS Address</label>
                  <input value={gpsAddress} onChange={(e) => setGpsAddress(e.target.value)} placeholder="EN-023-4567" className={`${inputCls} font-mono`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Contact Phone</label>
                    <input value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Tax Rate (%)</label>
                    <input type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Support Email</label>
                  <input type="email" value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Receipt Footer Message</label>
                  <textarea rows={2} value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)} className={`${inputCls} resize-none`} />
                </div>
              </>
            )}
          </Card>
        )}

        {/* ── Right Column ── */}
        <div className="space-y-6">
          {/* Personal Profile */}
          <Card icon={User} title="Personal Profile" onSubmit={handleProfileSubmit} isPending={savingProfile} success={profileSuccess} error={profileError}>
            <div>
              <label className={labelCls}>Full Name *</label>
              <input required value={personalName} onChange={(e) => setPersonalName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone Number *</label>
              <input required value={personalPhone} onChange={(e) => setPersonalPhone(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email Address *</label>
              <input required type="email" value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} className={inputCls} />
            </div>
          </Card>

          {/* Change Password */}
          <Card icon={Lock} title="Change Password" onSubmit={handlePasswordSubmit} isPending={savingPassword} saveLabel="Update Password" success={pwSuccess} error={pwError}>
            <div>
              <label className={labelCls}>Current Password *</label>
              <input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={`${inputCls} font-mono`} placeholder="••••••••" />
            </div>
            <div>
              <label className={labelCls}>New Password *</label>
              <input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputCls} font-mono`} placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className={labelCls}>Confirm New Password *</label>
              <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputCls} font-mono`} placeholder="••••••••" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
