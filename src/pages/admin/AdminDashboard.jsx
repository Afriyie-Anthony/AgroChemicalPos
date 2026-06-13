import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Clock,
  DollarSign,
  Award,
  Coins
} from 'lucide-react';

export default function AdminDashboard() {
  const { products, customers, transactions } = useStore();

  // Compute stats dynamically from store
  const dashboardStats = useMemo(() => {
    // 1. Sales Calculation
    const totalSales = transactions.reduce((acc, curr) => acc + curr.total, 0);
    const taxCollected = transactions.reduce((acc, curr) => acc + curr.tax, 0);
    const salesCount = transactions.length;

    // 2. Outstanding Credit
    const totalOutstandingCredit = customers.reduce((acc, curr) => acc + curr.outstandingCredit, 0);

    // 3. Low Stock Check
    let lowStockCount = 0;
    products.forEach(p => {
      const totalQty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
      if (totalQty <= p.reorderLevel) {
        lowStockCount++;
      }
    });

    // 4. Expiry Alerts
    let expiringSoonCount = 0;
    const today = new Date();
    const triggerDate = new Date();
    triggerDate.setDate(today.getDate() + 180);

    products.forEach(p => {
      p.batches.forEach(b => {
        const exp = new Date(b.expiryDate);
        if (exp > today && exp <= triggerDate) {
          expiringSoonCount++;
        }
      });
    });

    // 5. Payment method breakdown
    let cashSales = 0;
    let momoSales = 0;
    let cardSales = 0;
    let creditSales = 0;

    transactions.forEach(t => {
      if (t.paymentMethod === 'cash') cashSales += t.total;
      else if (t.paymentMethod === 'momo') momoSales += t.total;
      else if (t.paymentMethod === 'card') cardSales += t.total;
      else if (t.paymentMethod === 'credit') creditSales += t.total;
      else if (t.paymentMethod === 'split') {
        cashSales += t.splitAmounts?.cash || 0;
        momoSales += t.splitAmounts?.momo || 0;
        cardSales += t.splitAmounts?.card || 0;
      }
    });

    return {
      totalSales,
      taxCollected,
      salesCount,
      totalOutstandingCredit,
      lowStockCount,
      expiringSoonCount,
      payments: { cashSales, momoSales, cardSales, creditSales }
    };
  }, [products, customers, transactions]);

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

  // GRA compliance VAT summary
  const gravatSummary = useMemo(() => {
    const totalTax = dashboardStats.taxCollected;
    const vatPortion = totalTax * (13.125 / 18.125);
    const leviesPortion = totalTax * (5 / 18.125);

    return {
      vatPortion: Number(vatPortion.toFixed(2)),
      leviesPortion: Number(leviesPortion.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2))
    };
  }, [dashboardStats.taxCollected]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Page Title Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Admin Command Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time performance analytics for your agro-chemical shop</p>
        </div>
        <div className="flex space-x-2 bg-white dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start shadow-sm">
          <button className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-slate-950 rounded-lg shadow-sm">
            Today
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            This Week
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            Month
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Sales KPI */}
        <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-350 dark:hover:border-slate-700/80 transition-all shadow-sm group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Gross Revenue</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {formatCurrency(dashboardStats.totalSales)}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            From <span className="text-slate-800 dark:text-slate-200 font-bold">{dashboardStats.salesCount}</span> completed sales today
          </p>
        </div>

        {/* Credit KPI */}
        <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-350 dark:hover:border-slate-700/80 transition-all shadow-sm group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Debtors Credit</span>
            <span className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {formatCurrency(dashboardStats.totalOutstandingCredit)}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Requires active tracking & SMS reminders
          </p>
        </div>

        {/* Low Stock KPI */}
        <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-350 dark:hover:border-slate-700/80 transition-all shadow-sm group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Low Stock Alerts</span>
            <span className={`p-1.5 rounded-lg ${dashboardStats.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <h3 className={`text-2xl font-bold mt-2 tracking-tight transition-colors ${dashboardStats.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {dashboardStats.lowStockCount} Products
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Items at or below reorder levels
          </p>
        </div>

        {/* Expiry Alerts KPI */}
        <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-350 dark:hover:border-slate-700/80 transition-all shadow-sm group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Expiry Warnings</span>
            <span className={`p-1.5 rounded-lg ${dashboardStats.expiringSoonCount > 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <h3 className={`text-2xl font-bold mt-2 tracking-tight transition-colors ${dashboardStats.expiringSoonCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {dashboardStats.expiringSoonCount} Batches
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Expiring within next 6 months (FEFO)
          </p>
        </div>
      </div>

      {/* Middle Grid - Payment and GRA Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Payment Methods Breakdown</h4>
            <div className="space-y-4">
              {/* Cash Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Cash Collections</span>
                  <span className="text-slate-700 dark:text-slate-200">{formatCurrency(dashboardStats.payments.cashSales)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${dashboardStats.totalSales ? (dashboardStats.payments.cashSales / dashboardStats.totalSales) * 100 : 0}%` }}
                  />
                </div>
              </div>
              {/* MoMo Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Mobile Money (MoMo)</span>
                  <span className="text-slate-700 dark:text-slate-200">{formatCurrency(dashboardStats.payments.momoSales)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full rounded-full"
                    style={{ width: `${dashboardStats.totalSales ? (dashboardStats.payments.momoSales / dashboardStats.totalSales) * 100 : 0}%` }}
                  />
                </div>
              </div>
              {/* Credit Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Store Credit (Outstanding)</span>
                  <span className="text-slate-700 dark:text-slate-200">{formatCurrency(dashboardStats.payments.creditSales)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${dashboardStats.totalSales ? (dashboardStats.payments.creditSales / dashboardStats.totalSales) * 100 : 0}%` }}
                  />
                </div>
              </div>
              {/* Card Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>POS Card Swipe</span>
                  <span className="text-slate-700 dark:text-slate-200">{formatCurrency(dashboardStats.payments.cardSales)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${dashboardStats.totalSales ? (dashboardStats.payments.cardSales / dashboardStats.totalSales) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            * Split payments are distributed across respective buckets.
          </p>
        </div>

        {/* GRA VAT Compliance Ledger */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">GRA VAT Compliance Registry</h4>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20 dark:border-emerald-500/10 uppercase">GRA Ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">12.5% VAT Portion</span>
              <span className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-1 block">{formatCurrency(gravatSummary.vatPortion)}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">5.0% Levies (NHIL/GETF)</span>
              <span className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-1 block">{formatCurrency(gravatSummary.leviesPortion)}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Total Taxes Ledger</span>
              <span className="text-lg font-bold text-emerald-650 dark:text-emerald-400 mt-1 block">{formatCurrency(gravatSummary.totalTax)}</span>
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs space-y-2.5 text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Standard Taxable Value Base</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrency(dashboardStats.totalSales - dashboardStats.taxCollected)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
              <span>National Health Insurance Levy (NHIL @ 2.5%)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrency(gravatSummary.leviesPortion / 2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ghana Education Trust Fund Levy (GETFund @ 2.5%)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrency(gravatSummary.leviesPortion / 2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-800 dark:text-slate-200 font-bold">
              <span>Subtotal + Levies Base</span>
              <span>
                {formatCurrency(dashboardStats.totalSales - gravatSummary.vatPortion)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Value Added Tax (VAT @ 12.5%)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(gravatSummary.vatPortion)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Grid - Low Stock and Expiring Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Low Stock Warning Widget */}
        <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 animate-pulse" /> Critical Low Stock Items
          </h4>
          {criticalProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              <span className="font-bold">All stock counts are above reorder levels. Excellent!</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {criticalProducts.map(p => (
                <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Unit: {p.unit} | Brand: {p.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600 dark:text-amber-400">{p.totalQty} Left</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Reorder Level: {p.reorderLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FEFO Expiry Timeline */}
        <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <Clock className="w-4 h-4 text-red-500 mr-2" /> Expiry Tracking (FEFO Enforced)
          </h4>
          {expiringBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              <span className="font-bold">No active batches expiring within the next 180 days.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {expiringBatches.map((b, i) => (
                <div key={i} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{b.productName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Batch: <span className="font-mono text-emerald-600 dark:text-emerald-400">{b.batchNumber}</span> | Expiry: {new Date(b.expiryDate).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${b.daysLeft < 60 ? 'text-red-550 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>{b.daysLeft} Days Left</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Stock: {b.quantity} units</p>
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
