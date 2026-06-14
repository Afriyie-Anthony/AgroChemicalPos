import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  CreditCard
} from 'lucide-react';

// Import child widgets
import SalesTrendChart from '../../components/dashboard/admin/SalesTrendChart';
import PaymentBreakdown from '../../components/dashboard/admin/PaymentBreakdown';
import TopProductsChart from '../../components/dashboard/admin/TopProductsChart';
import CategoryDistributionChart from '../../components/dashboard/admin/CategoryDistributionChart';

export default function AdminDashboard() {
  const { products, customers, transactions } = useStore();
  const [timeFilter, setTimeFilter] = useState('day'); // 'day', 'month', 'year'

  // Filter transactions dynamically based on selected timeframe
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return transactions.filter(t => {
      if (t.status === 'voided') return false; // exclude voided sales

      const txDate = new Date(t.createdAt);

      if (timeFilter === 'day') {
        return txDate.toDateString() === today.toDateString();
      } else if (timeFilter === 'month') {
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      } else if (timeFilter === 'year') {
        return txDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [transactions, timeFilter]);

  // Compute overall stats dynamically from filtered timeframe data
  const dashboardStats = useMemo(() => {
    // 1. Sales Calculation
    const totalSales = filteredTransactions.reduce((acc, curr) => acc + curr.total, 0);
    const salesCount = filteredTransactions.length;

    // 2. Outstanding Credit (Remains overall aggregate)
    const totalOutstandingCredit = customers.reduce((acc, curr) => acc + curr.outstandingCredit, 0);

    // 3. Low Stock Check (Overall aggregate)
    let lowStockCount = 0;
    products.forEach(p => {
      const totalQty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
      if (totalQty <= p.reorderLevel) {
        lowStockCount++;
      }
    });

    // 4. Expiry Alerts (Overall aggregate)
    let expiringSoonCount = 0;
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setDate(now.getDate() + 180);

    products.forEach(p => {
      p.batches.forEach(b => {
        const exp = new Date(b.expiryDate);
        if (exp > now && exp <= triggerDate) {
          expiringSoonCount++;
        }
      });
    });

    // 5. Payment method breakdown (Only Cash and MoMo)
    let cashSales = 0;
    let momoSales = 0;

    filteredTransactions.forEach(t => {
      if (t.paymentMethod === 'cash') {
        cashSales += t.total;
      } else if (t.paymentMethod === 'momo') {
        momoSales += t.total;
      } else if (t.paymentMethod === 'split') {
        cashSales += t.splitAmounts?.cash || 0;
        momoSales += t.splitAmounts?.momo || 0;
      }
    });

    return {
      totalSales,
      salesCount,
      totalOutstandingCredit,
      lowStockCount,
      expiringSoonCount,
      payments: { cashSales, momoSales }
    };
  }, [products, customers, filteredTransactions]);

  // Find most low-stocked items to show in the widget
  const criticalProducts = useMemo(() => {
    return products
      .map(p => {
        const totalQty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
        return { ...p, totalQty };
      })
      .filter(p => p.totalQty <= p.reorderLevel)
      .slice(0, 4);
  }, [products]);

  // Find expiring soon batches
  const expiringBatches = useMemo(() => {
    const list = [];
    const today = new Date();
    products.forEach(p => {
      p.batches.forEach(b => {
        const diffTime = new Date(b.expiryDate) - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 180 && diffDays > 0) {
          list.push({
            productName: p.name,
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            expiryDate: b.expiryDate,
            daysLeft: diffDays
          });
        }
      });
    });
    return list.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4);
  }, [products]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header and Time Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Command Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time performance analytics for your agro-chemical shop</p>
        </div>
        <div className="flex space-x-2 bg-white dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850 self-start shadow-sm transition-colors duration-200">
          <button
            onClick={() => setTimeFilter('day')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeFilter === 'day'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeFilter === 'month'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeFilter('year')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeFilter === 'year'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gross Revenue */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gross Revenue</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-3.5">
            GHS {dashboardStats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
            From {dashboardStats.salesCount} completed sales
          </p>
        </div>

        {/* Outstanding Debtors */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Debtors Credit</span>
            <span className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-3.5">
            GHS {dashboardStats.totalOutstandingCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
            Overall outstanding shop debts
          </p>
        </div>

        {/* Low Stock count */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Low Stock Alerts</span>
            <span className={`p-1.5 rounded-lg ${dashboardStats.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <h3 className={`text-xl font-bold mt-3.5 ${dashboardStats.lowStockCount > 0 ? 'text-amber-505' : 'text-slate-850 dark:text-slate-200'}`}>
            {dashboardStats.lowStockCount} Products
          </h3>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
            Below safe reorder counts
          </p>
        </div>

        {/* Expiring Batches */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Expiry Warnings</span>
            <span className={`p-1.5 rounded-lg ${dashboardStats.expiringSoonCount > 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <h3 className={`text-xl font-bold mt-3.5 ${dashboardStats.expiringSoonCount > 0 ? 'text-red-550 dark:text-red-400' : 'text-slate-850 dark:text-slate-200'}`}>
            {dashboardStats.expiringSoonCount} Batches
          </h3>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
            Expiring within 6 months
          </p>
        </div>
      </div>

      {/* Main Charts & Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Dynamic Sales Trend curve widget */}
        <SalesTrendChart 
          filteredTransactions={filteredTransactions} 
          timeFilter={timeFilter} 
        />

        {/* Chart 2: Simplified Cash vs MoMo Payments Breakdown widget */}
        <PaymentBreakdown 
          payments={dashboardStats.payments} 
          totalSales={dashboardStats.totalSales} 
        />
      </div>

      {/* Grid: Top products and Category donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Top Selling Products horizontal visualizer widget */}
        <TopProductsChart filteredTransactions={filteredTransactions} />

        {/* Chart 4: Custom radial/donut Category share segments widget */}
        <CategoryDistributionChart filteredTransactions={filteredTransactions} />
      </div>

      {/* Critical stock and FEFO alerts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Low Stock Warning Widget */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 animate-pulse" /> Critical Low Stock Items
          </h4>
          {criticalProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              <span className="font-bold">All stock counts are above reorder levels. Excellent!</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-850/60">
              {criticalProducts.map(p => (
                <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-550">Unit: {p.unit} | Brand: {p.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600 dark:text-amber-400">{p.totalQty} Left</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">Reorder Level: {p.reorderLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FEFO Expiry Timeline */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <Clock className="w-4 h-4 text-red-500 mr-2" /> Expiry Tracking (FEFO Enforced)
          </h4>
          {expiringBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              <span className="font-bold">No active batches expiring within the next 180 days.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-850/60">
              {expiringBatches.map((b, i) => (
                <div key={i} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{b.productName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-550">Batch: <span className="font-mono text-emerald-600 dark:text-emerald-450">{b.batchNumber}</span> | Expiry: {new Date(b.expiryDate).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${b.daysLeft < 60 ? 'text-rose-500 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>{b.daysLeft} Days Left</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">Stock: {b.quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
