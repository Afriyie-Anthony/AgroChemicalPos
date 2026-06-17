import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useCustomers, useCreateCustomer, useAdjustCredit } from '../../hooks/useCustomers';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus,
  Search,
  Award,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  X,
  Users
} from 'lucide-react';

export default function Customers() {
  const { showAlert } = useStore();
  const { data: customers = [], isLoading } = useCustomers();
  const { mutateAsync: createCustomer } = useCreateCustomer();
  const { mutateAsync: adjustCreditApi } = useAdjustCredit();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('All');

  // Customer modal toggle
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  
  // Forms State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newGps, setNewGps] = useState('');
  const [newSegment, setNewSegment] = useState('Smallholder Farmer');
  const [newLimit, setNewLimit] = useState('500');

  const [creditAdjustment, setCreditAdjustment] = useState('');
  const [adjustDirection, setAdjustDirection] = useState('increase'); // increase or decrease

  const segments = ['All', 'Smallholder Farmer', 'Commercial Farmer', 'Agro-Dealer'];

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSegment = selectedSegment === 'All' || c.segment === selectedSegment;

      return matchesSearch && matchesSegment;
    });
  }, [customers, searchQuery, selectedSegment]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    try {
      await createCustomer({
        name: newName,
        phone: newPhone,
        email: newEmail || 'N/A',
        location: newLocation || 'N/A',
        gpsAddress: newGps || 'N/A',
        segment: newSegment,
        creditLimit: parseFloat(newLimit) || 500
      });

      showAlert('Customer registered successfully!', 'success', 'Success');
      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewLocation('');
      setNewGps('');
      setNewLimit('500');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to register customer', 'error', 'Error');
    }
  };

  const handleCreditAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!activeCustomer || !creditAdjustment) return;

    const val = parseFloat(creditAdjustment);
    const amount = adjustDirection === 'increase' ? val : -val;

    try {
      await adjustCreditApi({ id: activeCustomer.id, data: { amountChange: amount } });
      showAlert('Credit balance adjusted', 'success', 'Success');
      setShowCreditModal(false);
      setActiveCustomer(null);
      setCreditAdjustment('');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to adjust credit', 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Customer Database & Credit</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Record customer farm demographics, reward loyalty, and enforce credit boundaries</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Register Customer</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-xs relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, phone or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>
        <div className="flex space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1.5">
          {segments.map(seg => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
                selectedSegment === seg
                  ? 'bg-slate-800 dark:bg-slate-100 text-slate-100 dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-950/30 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Registry list */}
      <div className="premium-table-container">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Location / GPS</th>
                <th className="px-6 py-4">Credit (Owed / Limit)</th>
                <th className="px-6 py-4">Loyalty Points</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.map(c => {
                const creditUsed = Number(c.outstandingCredit);
                const creditLimit = Number(c.creditLimit);
                const creditPercent = Math.min(100, creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0);
                const isOverLimit = creditUsed >= creditLimit;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors text-xs">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{c.name}</p>
                        <span className="inline-flex items-center space-x-1 text-[9px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 mt-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{c.segment}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.location}</span>
                        </p>
                        <p className="font-mono text-[9px] text-slate-400 dark:text-slate-500 mt-1 pl-4.5">{c.gpsAddress}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] space-x-3">
                          <span className={`font-bold ${creditUsed > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {formatCurrency(creditUsed)} Owed
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">Limit: {formatCurrency(c.creditLimit)}</span>
                        </div>
                        <div className="w-24 bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isOverLimit ? 'bg-rose-500' : 'bg-purple-500'}`}
                            style={{ width: `${creditPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">{c.loyaltyPoints} Pts</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setActiveCustomer(c);
                          setShowCreditModal(true);
                        }}
                        className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        Adjust Credit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Customer */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Register Customer Account</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-655 dark:text-slate-500 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ama Serwaa"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0244123456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ama@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Location / Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Nsawam"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Ghana Post GPS Code</label>
                    <input
                      type="text"
                      placeholder="e.g. EN-023-4567"
                      value={newGps}
                      onChange={(e) => setNewGps(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Farmer Segment</label>
                    <select
                      value={newSegment}
                      onChange={(e) => setNewSegment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Smallholder Farmer">Smallholder</option>
                      <option value="Commercial Farmer">Commercial</option>
                      <option value="Agro-Dealer">Agro-Dealer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Credit Limit (GHS)</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl text-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Credit */}
      {showCreditModal && activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Adjust Credit Account</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{activeCustomer.name}</p>
              </div>
              <button onClick={() => { setShowCreditModal(false); setActiveCustomer(null); }} className="text-slate-400 hover:text-slate-655 dark:text-slate-500 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreditAdjustSubmit} className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 shadow-inner">
                <div className="flex justify-between">
                  <span>Current Outstanding credit:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(activeCustomer.outstandingCredit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Credit Limit:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(activeCustomer.creditLimit)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Adjustment Action</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDirection('increase')}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-xl border text-center transition-all flex items-center justify-center space-x-1.5 ${
                      adjustDirection === 'increase'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    <span>Owe More</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustDirection('decrease')}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-xl border text-center transition-all flex items-center justify-center space-x-1.5 ${
                      adjustDirection === 'decrease'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Repay Debt</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Amount (GHS) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={creditAdjustment}
                  onChange={(e) => setCreditAdjustment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreditModal(false); setActiveCustomer(null); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl text-xs shadow-sm"
                >
                  Apply Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
