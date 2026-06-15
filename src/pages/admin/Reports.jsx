import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  BarChart3, 
  TrendingUp, 
  Percent, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileSpreadsheet, 
  Calendar, 
  Boxes, 
  Receipt,
  User,
  Tags,
  AlertCircle
} from 'lucide-react';

export default function Reports() {
  const { transactions, products, purchaseOrders } = useStore();
  const [activeTab, setActiveTab] = useState('financials'); // 'financials', 'tax', 'movement'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  // Filter Transactions by Date Range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.status === 'voided') return false; // exclude voided from financial summaries
      if (dateFilter === 'all') return true;
      
      const date = new Date(t.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === 'today') {
        return date.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        return diffDays <= 7;
      } else if (dateFilter === 'month') {
        return diffDays <= 30;
      }
      return true;
    });
  }, [transactions, dateFilter]);

  // Tab 1: Financial Calculations (Sales and Profit & Loss)
  const financialData = useMemo(() => {
    let grossRevenue = 0;
    let totalCogs = 0;
    let transactionsCount = filteredTransactions.length;
    let paymentBreakdown = { cash: 0, momo: 0, card: 0, credit: 0 };

    filteredTransactions.forEach(t => {
      grossRevenue += t.total;
      
      // Calculate payment method split
      if (t.paymentMethod === 'cash') paymentBreakdown.cash += t.total;
      else if (t.paymentMethod === 'momo') paymentBreakdown.momo += t.total;
      else if (t.paymentMethod === 'card') paymentBreakdown.card += t.total;
      else if (t.paymentMethod === 'credit') paymentBreakdown.credit += t.total;
      
      // Calculate COGS
      t.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const unitCost = prod ? prod.costPrice : 0;
        totalCogs += (unitCost * item.quantity);
      });
    });

    const grossProfit = grossRevenue - totalCogs;
    const profitMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      totalCogs,
      grossProfit,
      profitMargin,
      transactionsCount,
      paymentBreakdown
    };
  }, [filteredTransactions, products]);

  // Tab 3: Dynamic Stock Movement Logs
  const stockMovements = useMemo(() => {
    const movements = [];

    // 1. Sales Logs (Decrease stock)
    transactions.forEach(t => {
      const statusLabel = t.status === 'voided' ? 'Voided Sale' : 'Sale Checkout';
      t.items.forEach(item => {
        movements.push({
          id: `m-sale-${t.id}-${item.productId}-${item.batchId}`,
          date: t.createdAt,
          type: t.status === 'voided' ? 'in' : 'out',
          typeLabel: statusLabel,
          productName: item.name,
          quantity: item.quantity,
          unit: item.unit,
          batchNumber: item.batchNumber,
          reference: t.transactionCode,
          user: t.cashierName
        });
      });
    });

    // 2. Received Purchase Orders Logs (Increase stock)
    purchaseOrders.forEach(po => {
      if (po.status === 'received') {
        po.items.forEach(item => {
          movements.push({
            id: `m-po-${po.id}-${item.productId}`,
            date: po.receivedAt || po.createdAt, // Fallback if receivedAt is undefined
            type: 'in',
            typeLabel: 'Procurement (GRN)',
            productName: item.name,
            quantity: item.quantity,
            unit: 'Units',
            batchNumber: 'New Batch / Restock',
            reference: po.poCode,
            user: 'System Admin'
          });
        });
      }
    });

    // Sort by Date Descending
    return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, purchaseOrders]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header and Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Reports & Auditing</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify revenues, gross profit margins, statutory GRA taxes, and inventory ledger checks</p>
        </div>
        <div className="flex items-center space-x-3 self-start">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs font-bold rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <option value="all">All-Time Performance</option>
            <option value="today">Today's Transactions</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
        </div>
      </div>

      {/* Tabs Layout Button Group */}
      <div className="flex border-b border-slate-200 dark:border-slate-880">
        <button
          onClick={() => setActiveTab('financials')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'financials'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Financial Overview
        </button>
        <button
          onClick={() => setActiveTab('movement')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'movement'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Stock Movement Log
        </button>
      </div>

      {/* Tab Content 1: Financial Overview */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Gross Sales Revenue</span>
              <h3 className="text-xl font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">GHS {financialData.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">From {financialData.transactionsCount} completed transactions</p>
            </div>
            
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Cost of Goods Sold (COGS)</span>
              <h3 className="text-xl font-bold mt-1.5 text-slate-700 dark:text-slate-200">GHS {financialData.totalCogs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Total wholesale stock purchase value</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Gross Profit</span>
              <h3 className={`text-xl font-bold mt-1.5 ${financialData.grossProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                GHS {financialData.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Revenue minus COGS</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Profit Margin (%)</span>
              <div className="flex items-center justify-between mt-1.5">
                <h3 className="text-xl font-bold">{financialData.profitMargin.toFixed(1)}%</h3>
                <span className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg"><Percent className="w-4 h-4" /></span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Profitability index</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales by Channel Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-1">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Sales Payment Breakdown</h3>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Cash Sales</span>
                  <span className="font-bold">GHS {financialData.paymentBreakdown.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Mobile Money (MoMo)</span>
                  <span className="font-bold">GHS {financialData.paymentBreakdown.momo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Card Sales</span>
                  <span className="font-bold">GHS {financialData.paymentBreakdown.card.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Outstanding Credit Sales</span>
                  <span className="font-bold text-rose-500">GHS {financialData.paymentBreakdown.credit.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Explanatory note or checklist */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Financial Reports Advisory</h3>
              <div className="space-y-3.5 text-xs text-slate-500 dark:text-slate-400">
                <p>This report calculates **Gross Profit** based on actual unit cost prices recorded in stock batches versus final point-of-sale checkout prices. Voided transactions are automatically omitted from both sales and cost of goods sold calculations.</p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Tab Content 3: Stock Movement Log */}
      {activeTab === 'movement' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-805 dark:text-slate-205">Inventory Audit Trail Log</h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-lg uppercase">
              {stockMovements.length} logged events
            </span>
          </div>

          <div className="premium-table-container">
            <table className="premium-table premium-table-zebra">
              <thead>
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Movement Type</th>
                  <th className="px-4 py-3">Product Description</th>
                  <th className="px-4 py-3">Batch Number</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {stockMovements.map(mov => (
                  <tr key={mov.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-medium">{new Date(mov.date).toLocaleString('en-GB')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${
                        mov.type === 'in'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}>
                        {mov.typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-750 dark:text-slate-250">{mov.productName}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{mov.batchNumber}</td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      mov.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}>
                      {mov.type === 'in' ? '+' : '-'}{mov.quantity} {mov.unit}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-600 dark:text-slate-400">{mov.reference}</td>
                    <td className="px-4 py-3 font-medium text-slate-500">{mov.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
