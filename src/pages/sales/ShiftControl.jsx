import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Clock,
  User,
  DollarSign,
  CheckCircle2,
  Calculator,
  AlertCircle,
  History,
  Unlock,
  Lock
} from 'lucide-react';

export default function ShiftControl() {
  const { activeShift, openShift, closeShift, shifts } = useStore();
  const [openingFloat, setOpeningFloat] = useState('');
  
  // Closing shift states
  const [showDenomCalculator, setShowDenomCalculator] = useState(false);
  const [countedTillCash, setCountedTillCash] = useState('');

  // GHS Denominational Counter State
  const [denoms, setDenoms] = useState({
    n200: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
    n5: 0,
    c2: 0,
    c1: 0,
    c50p: 0,
    c20p: 0,
    c10p: 0
  });

  const handleOpenShift = (e) => {
    e.preventDefault();
    const float = parseFloat(openingFloat);
    if (isNaN(float) || float < 0) {
      alert('Please enter a valid float amount');
      return;
    }
    const res = openShift(float);
    if (!res.success) {
      alert(res.message);
    }
    setOpeningFloat('');
  };

  const denominationalTotal = useMemo(() => {
    return (
      denoms.n200 * 200 +
      denoms.n100 * 100 +
      denoms.n50 * 50 +
      denoms.n20 * 20 +
      denoms.n10 * 10 +
      denoms.n5 * 5 +
      denoms.c2 * 2 +
      denoms.c1 * 1 +
      denoms.c50p * 0.5 +
      denoms.c20p * 0.2 +
      denoms.c10p * 0.1
    );
  }, [denoms]);

  const applyDenomTotal = () => {
    setCountedTillCash(denominationalTotal.toFixed(2));
    setShowDenomCalculator(false);
  };

  const handleCloseShift = (e) => {
    e.preventDefault();
    const countedVal = parseFloat(countedTillCash);
    if (isNaN(countedVal) || countedVal < 0) {
      alert('Please enter a valid cash count in the till');
      return;
    }

    const res = closeShift(countedVal);
    if (res.success) {
      alert('Shift closed successfully. Summary has been saved.');
      setDenoms({
        n200: 0, n100: 0, n50: 0, n20: 0, n10: 0, n5: 0,
        c2: 0, c1: 0, c50p: 0, c20p: 0, c10p: 0
      });
      setCountedTillCash('');
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Shift & Till Reconciliation</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Open/Close cashier shifts, log cash-drawers, and audit end-of-day balances</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Shift Controls (Open / Close) */}
        <div className="lg:col-span-2 space-y-6">
          {activeShift ? (
            /* Close Shift Card */
            <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-900">
                <div className="flex items-center space-x-2">
                  <Unlock className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Active Shift Log</h3>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-0.5">Shift In Progress</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Opened: {formatDateTime(activeShift.openedAt)}</span>
                </span>
              </div>

              {/* Shift Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Cashier</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px] block">{activeShift.cashierName}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Opening Float</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{formatCurrency(activeShift.openingFloat)}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Expected Cash</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">{formatCurrency(activeShift.expectedCash)}</span>
                  </div>
                </div>
              </div>

              {/* Sales breakdown */}
              <div className="border-t border-slate-100 dark:border-slate-900 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Shift Sales Summary</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-xs p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-xl">
                    <span className="text-slate-400 dark:text-slate-500 block">Cash Sales</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-1 block">{formatCurrency(activeShift.salesSummary.cash)}</span>
                  </div>
                  <div className="text-xs p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-xl">
                    <span className="text-slate-400 dark:text-slate-500 block">MoMo Sales</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-1 block">{formatCurrency(activeShift.salesSummary.momo)}</span>
                  </div>
                  <div className="text-xs p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-xl">
                    <span className="text-slate-400 dark:text-slate-500 block">Store Credit</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-1 block">{formatCurrency(activeShift.salesSummary.credit)}</span>
                  </div>
                  <div className="text-xs p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-xl">
                    <span className="text-slate-400 dark:text-slate-500 block">Total Sales</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-1 block">{formatCurrency(activeShift.salesSummary.totalSales)}</span>
                  </div>
                </div>
              </div>

              {/* Close Shift Form */}
              <form onSubmit={handleCloseShift} className="border-t border-slate-100 dark:border-slate-900 pt-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Close Shift Verification</h4>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Actual Cash in Till (GHS) *</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={countedTillCash}
                        onChange={(e) => setCountedTillCash(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDenomCalculator(!showDenomCalculator)}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-slate-800 whitespace-nowrap flex items-center space-x-1"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Calculator</span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2 bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 whitespace-nowrap"
                  >
                    Lock Till & Close Shift
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Open Shift Card */
            <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Open New Shift</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">To begin processing sales, cashiers must declare an opening float balance.</p>
                </div>
              </div>

              <form onSubmit={handleOpenShift} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Opening Cash Float (GHS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Enter till cash, e.g. 100.00"
                    value={openingFloat}
                    onChange={(e) => setOpeningFloat(e.target.value)}
                    className="w-full max-w-md px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  Confirm Open Shift
                </button>
              </form>
            </div>
          )}

          {/* GHS Denominational Calculator Modal/Section */}
          {showDenomCalculator && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-205 dark:border-slate-900 pb-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Calculator className="w-4 h-4 text-emerald-500" />
                  <span>GHS Coin/Note Denominations Counter</span>
                </h4>
                <button onClick={() => setShowDenomCalculator(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                {/* 200 Note */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">GH₵ 200:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.n200}
                    onChange={(e) => setDenoms({...denoms, n200: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 100 Note */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">GH₵ 100:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.n100}
                    onChange={(e) => setDenoms({...denoms, n100: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 50 Note */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">GH₵ 50:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.n50}
                    onChange={(e) => setDenoms({...denoms, n50: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 20 Note */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">GH₵ 20:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.n20}
                    onChange={(e) => setDenoms({...denoms, n20: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 10 Note */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">GH₵ 10:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.n10}
                    onChange={(e) => setDenoms({...denoms, n10: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 5 Note */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">GH₵ 5:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.n5}
                    onChange={(e) => setDenoms({...denoms, n5: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 2 Coin */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">GH₵ 2:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.c2}
                    onChange={(e) => setDenoms({...denoms, c2: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 1 Coin */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">GH₵ 1:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.c1}
                    onChange={(e) => setDenoms({...denoms, c1: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 50p Coin */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">50p Coin:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.c50p}
                    onChange={(e) => setDenoms({...denoms, c50p: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 20p Coin */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">20p Coin:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.c20p}
                    onChange={(e) => setDenoms({...denoms, c20p: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
                {/* 10p Coin */}
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-slate-500 dark:text-slate-400 font-semibold">10p Coin:</span>
                  <input
                    type="number"
                    min="0"
                    value={denoms.c10p}
                    onChange={(e) => setDenoms({...denoms, c10p: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-900 pt-4">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Sum Total: {formatCurrency(denominationalTotal)}</span>
                <button
                  type="button"
                  onClick={applyDenomTotal}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Apply Total to Till
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Shift Audit History logs */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
            <History className="w-4 h-4 text-slate-400" />
            <span>Reconciliation History</span>
          </h3>
          {shifts.length === 0 ? (
            <div className="bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 text-center text-xs text-slate-400 dark:text-slate-500 shadow-sm">
              No previous shift logs found.
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
              {shifts.map((s) => {
                const diff = s.countedCash - s.expectedCash;
                const isMatch = Math.abs(diff) < 0.01;
                const isShort = diff < -0.01;

                return (
                  <div key={s.id} className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">Cashier: {s.cashierName}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Closed: {formatDateTime(s.closedAt)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        isMatch ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        isShort ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-655 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {isMatch ? 'MATCHED' : isShort ? 'SHORTAGE' : 'OVERAGE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-900 pt-2">
                      <div>
                        <span>Expected Cash:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">{formatCurrency(s.expectedCash)}</span>
                      </div>
                      <div>
                        <span>Declared Till Count:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">{formatCurrency(s.countedCash)}</span>
                      </div>
                    </div>

                    {!isMatch && (
                      <div className="text-[10px] font-bold flex justify-between bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-900">
                        <span className="text-slate-400 dark:text-slate-500">Variance:</span>
                        <span className={isShort ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>
                          {isShort ? '-' : '+'}{formatCurrency(Math.abs(diff))}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
