import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useCustomers, useRecordRepayment } from '../../hooks/useCustomers';
import { useTransactions } from '../../hooks/useTransactions';
import { 
  CreditCard, 
  Search, 
  ArrowUpDown, 
  Plus, 
  User, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  ShieldAlert,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

export default function CreditAccounts() {
  const { showAlert } = useStore();
  const { data: customers = [], isLoading: loadingCustomers } = useCustomers();
  const { data: responseData, isLoading: loadingTransactions } = useTransactions({});
  const transactions = responseData?.data || [];
  const { mutateAsync: recordRepaymentApi } = useRecordRepayment();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('highest-debt'); // 'highest-debt', 'lowest-debt', 'name'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Stats Calculations
  const stats = useMemo(() => {
    const debtors = customers.filter(c => Number(c.outstandingCredit) > 0);
    const totalOutstanding = debtors.reduce((sum, c) => sum + Number(c.outstandingCredit), 0);
    const avgDebt = debtors.length > 0 ? totalOutstanding / debtors.length : 0;
    const totalCreditLimits = customers.reduce((sum, c) => sum + Number(c.creditLimit), 0);
    const riskExposurePercentage = totalCreditLimits > 0 ? (totalOutstanding / totalCreditLimits) * 100 : 0;

    return {
      debtorsCount: debtors.length,
      totalOutstanding,
      avgDebt,
      riskExposurePercentage
    };
  }, [customers]);

  // Filtered and Sorted Customers
  const processedCustomers = useMemo(() => {
    return customers
      .filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              c.phone.includes(searchTerm);
        // We can show all or just those with credits. Let's show all but highlight those with outstanding credits.
        return matchesSearch;
      })
      .sort((a, b) => {
        const debtA = Number(a.outstandingCredit);
        const debtB = Number(b.outstandingCredit);
        if (sortOrder === 'highest-debt') {
          return debtB - debtA;
        } else if (sortOrder === 'lowest-debt') {
          return debtA - debtB;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
  }, [customers, searchTerm, sortOrder]);

  // Get specific transactions ledger for a customer
  const customerLedger = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter(t => t.customerId === selectedCustomer.id);
  }, [transactions, selectedCustomer]);

  const handleRepaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !repayAmount) return;
    const amount = parseFloat(repayAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await recordRepaymentApi({ id: selectedCustomer.id, data: { amount } });
      showAlert('Repayment recorded successfully', 'success', 'Success');
      setShowRepayModal(false);
      setRepayAmount('');
      setSelectedCustomer(null);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to record repayment', 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credit & Debtors Ledger</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Track customer credit terms, outstanding debts, risk exposure, and repayments</p>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Outstanding Debt</span>
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">GHS {stats.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-550 dark:text-rose-400 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Active Debtors</span>
            <h3 className="text-xl font-bold">{stats.debtorsCount} Accounts</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Avg Outstanding Debt</span>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-250">GHS {stats.avgDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Credit Limit Exposure</span>
            <h3 className="text-xl font-bold">{stats.riskExposurePercentage.toFixed(1)}% Limit Used</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-colors"
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 dark:text-slate-300"
          >
            <option value="highest-debt">Outstanding Debt (Highest)</option>
            <option value="lowest-debt">Outstanding Debt (Lowest)</option>
            <option value="name">Alphabetical (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Grid List of Debtors */}
      {loadingCustomers ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {processedCustomers.map(cust => {
          const outstandingCredit = Number(cust.outstandingCredit);
          const creditLimit = Number(cust.creditLimit);
          const limitPercentage = creditLimit > 0 ? (outstandingCredit / creditLimit) * 100 : 0;
          const isOverLimit = outstandingCredit > creditLimit;

          return (
            <div 
              key={cust.id} 
              className={`bg-white dark:bg-slate-950 border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-750 transition-all ${
                outstandingCredit > 0 ? 'border-amber-200/60 dark:border-amber-500/10' : 'border-slate-200 dark:border-slate-850'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{cust.name}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{cust.segment}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${
                    outstandingCredit > 0 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                  }`}>
                    {outstandingCredit > 0 ? 'DEBTOR' : 'NO DEBT'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Outstanding Debt</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold">
                      GHS {outstandingCredit.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Credit Limit Meter */}
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        limitPercentage >= 90 ? 'bg-rose-500' : limitPercentage >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(limitPercentage, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Limit: GHS {creditLimit.toFixed(2)}</span>
                    <span>{limitPercentage.toFixed(0)}% utilized</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-900/60 text-xs">
                  <p className="text-slate-500 dark:text-slate-450 flex items-center space-x-1.5">
                    <span className="font-semibold text-[10px] text-slate-400">Phone:</span>
                    <span>{cust.phone}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-450 flex items-center space-x-1.5">
                    <span className="font-semibold text-[10px] text-slate-400">GPS:</span>
                    <span className="font-mono">{cust.gpsAddress}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-slate-50 dark:border-slate-900">
                <button
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setShowLedgerModal(true);
                  }}
                  className="py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-xl text-slate-700 dark:text-slate-350 transition-colors shadow-sm flex items-center justify-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ledger</span>
                </button>
                <button
                  disabled={cust.outstandingCredit === 0}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setShowRepayModal(true);
                  }}
                  className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center space-x-1 ${
                    cust.outstandingCredit > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow active:scale-[0.98]'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-650 cursor-not-allowed border border-slate-200 dark:border-slate-850'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Repay Debt</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modal: Log Repayment */}
      {showRepayModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Log Repayment</h2>
              <button onClick={() => { setShowRepayModal(false); setSelectedCustomer(null); }} className="text-slate-400 hover:text-slate-600 dark:text-slate-550"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleRepaymentSubmit} className="p-6 space-y-4 text-xs text-slate-850 dark:text-slate-250">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Profile</p>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedCustomer.name}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Outstanding:</span>
                  <span className="font-bold text-rose-500">GHS {selectedCustomer.outstandingCredit.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Repayment Amount (GHS) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={selectedCustomer.outstandingCredit}
                  min="0.01"
                  placeholder="Enter amount to pay"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="cash">Cash Payment</option>
                  <option value="momo">Mobile Money (MoMo)</option>
                  <option value="cheque">Bank Cheque</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowRepayModal(false); setSelectedCustomer(null); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl shadow-sm"
                >
                  Record Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customer Statements / Ledger */}
      {showLedgerModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-150 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Customer Statement Ledger</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Historical credit sales statement for {selectedCustomer.name}</p>
              </div>
              <button onClick={() => { setShowLedgerModal(false); setSelectedCustomer(null); }} className="text-slate-400 hover:text-slate-600 dark:text-slate-550"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Customer Details</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedCustomer.name}</p>
                  <p className="text-slate-500 mt-0.5">{selectedCustomer.phone}</p>
                  <p className="text-slate-550 mt-0.5 font-mono">{selectedCustomer.gpsAddress}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Accounts Summary</span>
                  <p className="mt-1 font-bold text-rose-500 text-sm">Debt: GHS {selectedCustomer.outstandingCredit.toFixed(2)}</p>
                  <p className="text-slate-550 mt-0.5">Credit Limit: GHS {selectedCustomer.creditLimit.toFixed(2)}</p>
                  <p className="text-emerald-500 font-bold mt-0.5">Points: {selectedCustomer.loyaltyPoints}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2.5">Credit Transactions</h4>
                {customerLedger.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-450 font-bold">No registered sales history found for this account.</p>
                  </div>
                ) : (
                  <div className="premium-table-container">
                    <table className="premium-table premium-table-zebra">
                      <thead>
                        <tr>
                          <th className="px-4 py-3">Txn Code</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Payment Method</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                        {customerLedger.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-[#0a6c3f] dark:text-emerald-400">{tx.transactionCode}</td>
                            <td className="px-4 py-3 text-slate-500">{new Date(tx.createdAt).toLocaleDateString('en-GB')}</td>
                            <td className="px-4 py-3 uppercase font-bold text-[10px]">{tx.paymentMethod}</td>
                            <td className="px-4 py-3 text-right font-bold">GHS {tx.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end flex-shrink-0">
              <button
                onClick={() => { setShowLedgerModal(false); setSelectedCustomer(null); }}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
