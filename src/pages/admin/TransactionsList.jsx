import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Receipt, Search, Eye, AlertCircle, X, ShieldAlert, Check, Printer, DollarSign, ShoppingBag, TrendingUp, Activity } from 'lucide-react';

import { useTransactions, useVoidTransaction } from '../../hooks/useTransactions';

export default function TransactionsList() {
  const { showAlert } = useStore();
  const { data: responseData, isLoading } = useTransactions({});
  const transactions = responseData?.data || [];
  const metrics = responseData?.metrics || { numSales: 0, totalSellingPrice: 0, totalCostPrice: 0, profit: 0 };
  
  const { mutateAsync: voidTransactionApi } = useVoidTransaction();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('All');
  
  // Modal toggle state
  const [activeTrx, setActiveTrx] = useState(null);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.transactionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMethod = selectedMethod === 'All' || t.paymentMethod === selectedMethod;

      return matchesSearch && matchesMethod;
    });
  }, [transactions, searchQuery, selectedMethod]);

  const handleVoidSubmit = async (e) => {
    e.preventDefault();
    if (!activeTrx || !voidReason) return;

    try {
      await voidTransactionApi({ id: activeTrx.id, data: { voidReason } });
      showAlert('Transaction successfully voided. Stock returned to inventory.', 'success', 'Transaction Voided');
      
      // Update local modal state with voided status so it displays correctly before unmounting
      setActiveTrx({ ...activeTrx, status: 'voided', voidReason, voidedAt: new Date().toISOString() });
      setShowVoidDialog(false);
      setVoidReason('');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to void transaction', 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Sales & Transaction History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Audit checkout registers, view receipts, and void erroneous transactions</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Number of Sales</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{metrics.numSales}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Cost Price</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(metrics.totalCostPrice)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Selling Price</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(metrics.totalSellingPrice)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Profit</p>
            <h3 className={`text-xl font-bold ${metrics.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {formatCurrency(metrics.profit)}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metrics.profit >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-xs relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by code, customer, or cashier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>
        
        <div className="flex space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['All', 'cash', 'momo', 'credit'].map(m => (
            <button
              key={m}
              onClick={() => setSelectedMethod(m)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all uppercase ${
                selectedMethod === m
                  ? 'bg-slate-800 dark:bg-slate-100 text-slate-100 dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-850'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="premium-table-container">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th className="px-6 py-4">Trx Code</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Cashier</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status / Method</th>
                <th className="px-6 py-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                      <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">No transactions found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => {
                  const isVoided = t.status === 'voided';
                  return (
                    <tr key={t.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors text-xs ${isVoided ? 'opacity-50 line-through' : ''}`}>
                      <td className="px-6 py-4 font-mono font-bold text-slate-850 dark:text-slate-200">{t.transactionCode}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDateTime(t.createdAt)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{t.customerName || 'Walk-in Customer'}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{t.cashierName}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          GHS {Number(t.total).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            isVoided 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-655 dark:text-emerald-450 border border-emerald-500/20'
                          }`}>
                            {isVoided ? 'VOIDED' : 'SUCCESS'}
                          </span>
                          <span className="text-[10px] text-slate-450 uppercase font-semibold">
                            ({t.paymentMethod})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setActiveTrx(t)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Receipt View & Voiding controls */}
      {activeTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-sm">
          <div id="receipt-print-area" className="w-full max-w-sm bg-white border border-slate-300 rounded-3xl overflow-hidden shadow-2xl p-6 font-mono text-[11px] text-slate-950 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="text-center space-y-1 relative">
              <button 
                onClick={() => { setActiveTrx(null); setShowVoidDialog(false); }} 
                className="absolute -top-3 -right-3 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 no-print"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-lg">🌿</span>
              <h2 className="text-sm font-bold uppercase">AgroChem POS Store</h2>
              <p>Nsawam Main Road, Eastern Region</p>
              <p>GPS: EN-023-4567 | Phone: 0244123456</p>
              <p className="border-b border-dashed border-slate-400 pb-2">GRA TIN: GHA-98765432-1</p>
            </div>

            {/* Void Banner */}
            {activeTrx.status === 'voided' && (
              <div className="my-2.5 p-2 bg-red-100 border border-red-200 rounded text-center text-red-700 font-sans font-bold">
                ⚠️ VOIDED TRANSACTION
                <span className="block text-[9px] font-normal font-mono mt-0.5">Reason: {activeTrx.voidReason}</span>
              </div>
            )}

            {/* Meta */}
            <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-slate-900">
              <div className="flex justify-between">
                <span>Trx Code:</span>
                <span className="font-bold">{activeTrx.transactionCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(activeTrx.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{activeTrx.cashierName}</span>
              </div>
              {activeTrx.customerName && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{activeTrx.customerName}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-dashed border-slate-400 pb-2">
                <span>Pay Mode:</span>
                <span className="font-bold uppercase">{activeTrx.paymentMethod}</span>
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-2 text-slate-900">
              <div className="flex font-bold">
                <span className="flex-1">Item Description</span>
                <span className="w-10 text-center">Qty</span>
                <span className="w-20 text-right">Price</span>
              </div>
              {activeTrx.items.map((it, idx) => (
                <div key={idx} className="flex">
                  <div className="flex-1">
                    <span>{it.productName || it.name}</span>
                  </div>
                  <span className="w-10 text-center">{Number(it.quantity).toFixed(2)}</span>
                  <span className="w-20 text-right">{formatCurrency((it.price - it.discount) * it.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-slate-900 font-medium">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(activeTrx.subtotal || activeTrx.total)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-dotted border-slate-300">
                <span>Total Paid:</span>
                <span>{formatCurrency(activeTrx.total)}</span>
              </div>
              {activeTrx.paymentMethod === 'cash' && activeTrx.amountPaid && (
                <>
                  <div className="flex justify-between pt-1">
                    <span>Cash Tendered:</span>
                    <span>{formatCurrency(activeTrx.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Change Returned:</span>
                    <span>{formatCurrency(activeTrx.amountPaid - activeTrx.total)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer advice */}
            <div className="text-center pt-3 space-y-1.5">
              <p className="font-bold uppercase text-red-600 flex items-center justify-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Safety Warning</span>
              </p>
              <p className="text-[9px] text-slate-600 font-sans leading-relaxed">
                Ensure all chemicals are locked away from kids. Always wash hands after usage. Report any adverse reactions to MoFA/EPA.
              </p>
              <p className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 font-bold">Thank you for your business!</p>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-2 no-print">
              {activeTrx.status !== 'voided' && (
                <>
                  {!showVoidDialog ? (
                    <button
                      onClick={() => setShowVoidDialog(true)}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-xs font-sans transition-all flex items-center justify-center space-x-1.5 shadow"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Void This Transaction</span>
                    </button>
                  ) : (
                    <form onSubmit={handleVoidSubmit} className="space-y-2.5 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase font-sans">Reason for Voiding *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Double entry, Customer returned item"
                        value={voidReason}
                        onChange={(e) => setVoidReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-red-500 font-sans"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowVoidDialog(false)}
                          className="flex-1 py-1.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg font-sans border border-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg font-sans shadow"
                        >
                          Void Sale
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
              
              <div className="flex space-x-2 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-emerald-500 text-slate-955 hover:bg-emerald-400 font-bold py-2.5 rounded-xl text-xs flex justify-center items-center space-x-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => { setActiveTrx(null); setShowVoidDialog(false); }}
                  className="flex-1 bg-slate-900 text-white hover:bg-slate-850 font-bold py-2.5 rounded-xl text-xs font-mono"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
