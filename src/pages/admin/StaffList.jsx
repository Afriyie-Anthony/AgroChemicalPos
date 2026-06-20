import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useStaffList, useCreateStaff, useUpdateStaff } from '../../hooks/useStaff';
import { useTransactions } from '../../hooks/useTransactions';
import { 
  UserCheck, 
  Plus, 
  Mail, 
  Phone, 
  Shield, 
  Percent, 
  DollarSign, 
  UserX, 
  X, 
  Key, 
  UserPlus, 
  Edit3
} from 'lucide-react';

export default function StaffList() {
  const { data: responseData } = useTransactions({});
  const transactions = responseData?.data || [];
  const { data: staffList = [], isLoading } = useStaffList();
  const { mutate: createStaff, isPending: isCreating } = useCreateStaff();
  const { mutate: updateStaffApi, isPending: isUpdating } = useUpdateStaff();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeStaff, setActiveStaff] = useState(null);

  // Form Inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('sales');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');

  // Sales Analytics
  const staffAnalytics = useMemo(() => {
    const analytics = {};
    let totalSalesSum = 0;

    // Initialize map
    staffList.forEach(s => {
      analytics[s.id] = { totalSales: 0 };
    });

    // Populate from completed transactions
    transactions.forEach(t => {
      if (t.status !== 'voided' && analytics[t.cashierId]) {
        analytics[t.cashierId].totalSales += t.total;
      }
    });

    // Sum overall sales
    staffList.forEach(s => {
      const stats = analytics[s.id] || { totalSales: 0 };
      totalSalesSum += stats.totalSales;
      analytics[s.id] = stats;
    });

    return {
      individual: analytics,
      totalSalesSum
    };
  }, [staffList, transactions]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    createStaff({
      name,
      phone,
      email,
      role,
      password,
    }, {
      onSuccess: () => {
        setShowAddModal(false);
        resetForm();
      }
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!activeStaff) return;

    updateStaffApi({
      id: activeStaff.id,
      data: {
        name,
        phone,
        email,
        role,
        status,
        ...(password ? { password } : {})
      }
    }, {
      onSuccess: () => {
        setActiveStaff(null);
        resetForm();
      }
    });
  };

  const openEditModal = (staff) => {
    setActiveStaff(staff);
    setName(staff.name);
    setPhone(staff.phone || '');
    setEmail(staff.email);
    setRole(staff.role);
    setPassword('');
    setStatus(staff.status);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRole('sales');
    setPassword('');
    setStatus('active');
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Credentials & Access</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage team user login roles, security passwords, and sales analytics</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4 text-slate-955" />
          <span>Add Staff Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Active Team Size</span>
          <h3 className="text-xl font-bold mt-1">{staffList.filter(s => s.status === 'active').length} Cashiers</h3>
        </div>
        <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Store Sales Volume</span>
          <h3 className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">GHS {staffAnalytics.totalSalesSum.toFixed(2)}</h3>
        </div>
      </div>

      {/* Staff Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {staffList.map(staff => {
          const stats = staffAnalytics.individual[staff.id] || { totalSales: 0 };

          return (
            <div 
              key={staff.id} 
              className={`bg-white dark:bg-slate-950 border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-750 transition-all ${
                staff.status !== 'active' ? 'border-dashed border-slate-250 dark:border-slate-800 opacity-60' : 'border-slate-200 dark:border-slate-850'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-sm text-emerald-500">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-none">{staff.name}</h3>
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold tracking-wide uppercase mt-1 inline-block">{staff.role} Account</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${
                    staff.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-450' 
                      : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-450'
                  }`}>
                    {staff.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850 text-xs mt-3">
                  <span className="text-slate-400 text-[9px] font-bold uppercase block">Total Sales</span>
                  <p className="font-bold text-slate-805 dark:text-slate-205 mt-0.5">GHS {stats.totalSales.toFixed(2)}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-900/60 text-xs">
                  <p className="text-slate-500 dark:text-slate-450 flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{staff.email}</span>
                  </p>
                  {staff.phone && (
                    <p className="text-slate-500 dark:text-slate-450 flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{staff.phone}</span>
                    </p>
                  )}
                  <p className="text-slate-550 dark:text-slate-450 flex items-center space-x-2">
                    <Key className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-mono">Code: ••••••••</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => openEditModal(staff)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-xl text-slate-700 dark:text-slate-300 transition-colors shadow-sm focus:outline-none flex items-center justify-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Configure Account</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Staff */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Add Staff Account</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:text-slate-550"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs text-slate-850 dark:text-slate-250">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rita Asare"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rita@agrochem.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 0541234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">PIN / Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. sales123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="sales">Sales Assistant</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-emerald-500 text-slate-955 hover:bg-emerald-400 font-bold rounded-xl shadow-sm disabled:opacity-60 flex items-center space-x-2"
                >
                  {isCreating ? <span className="animate-spin w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full"></span> : null}
                  <span>Create Staff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Staff */}
      {activeStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Configure Staff Account</h2>
              <button onClick={() => { setActiveStaff(null); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:text-slate-550"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs text-slate-850 dark:text-slate-250">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rita Asare"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rita@agrochem.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 0541234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">PIN / Password (Leave blank to keep)</label>
                  <input
                    type="password"
                    placeholder="e.g. sales123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="sales">Sales Assistant</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="active">Active Access Granted</option>
                  <option value="inactive">Suspended / Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => { setActiveStaff(null); resetForm(); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl shadow-sm disabled:opacity-60 flex items-center space-x-2"
                >
                  {isUpdating ? <span className="animate-spin w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full"></span> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
