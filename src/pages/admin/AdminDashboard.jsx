import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useProductList } from '../../hooks/useProduct';
import { formatCurrency } from '../../utils/formatters';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  CreditCard,
  TrendingDown,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie
} from 'recharts';

// Import child widgets
import SalesTrendChart from '../../components/dashboard/admin/SalesTrendChart';
import PaymentBreakdown from '../../components/dashboard/admin/PaymentBreakdown';
import TopProductsChart from '../../components/dashboard/admin/TopProductsChart';
import CategoryDistributionChart from '../../components/dashboard/admin/CategoryDistributionChart';

export default function AdminDashboard() {
  const { customers, transactions, expenses, currentUser } = useStore();
  const { data: products = [] } = useProductList();
  const [timeFilter, setTimeFilter] = useState('day'); // 'day', 'month', 'year'
  const isAdmin = currentUser?.role === 'admin';

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

  // Filter expenses dynamically based on selected timeframe
  const filteredExpenses = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return expenses.filter(e => {
      const expDate = new Date(e.date);

      if (timeFilter === 'day') {
        return expDate.toDateString() === today.toDateString();
      } else if (timeFilter === 'month') {
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      } else if (timeFilter === 'year') {
        return expDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [expenses, timeFilter]);

  // Compute overall stats dynamically from filtered timeframe data
  const dashboardStats = useMemo(() => {
    // 1. Sales Calculation
    const totalSales = filteredTransactions.reduce((acc, curr) => acc + Number(curr.total), 0);
    const salesCount = filteredTransactions.length;

    // 2. Outstanding Credit (Remains overall aggregate)
    const totalOutstandingCredit = customers.reduce((acc, curr) => acc + Number(curr.outstandingCredit), 0);

    // 3. Low Stock Check (Overall aggregate)
    let lowStockCount = 0;
    products.forEach(p => {
      const totalQty = p.batches.reduce((sum, b) => sum + Number(b.quantity), 0);
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

    // 6. COGS and Profits Calculations
    let totalCogs = 0;
    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const unitCost = prod ? prod.costPrice : 0;
        totalCogs += (unitCost * item.quantity);
      });
    });

    const grossProfit = totalSales - totalCogs;
    const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const netProfit = grossProfit - totalExpenses;

    return {
      totalSales,
      salesCount,
      totalOutstandingCredit,
      lowStockCount,
      expiringSoonCount,
      payments: { cashSales, momoSales },
      totalCogs,
      grossProfit,
      totalExpenses,
      netProfit
    };
  }, [products, customers, filteredTransactions, filteredExpenses]);

  // Financial Chart Data (Revenue, COGS, Expenses, Net Profit)
  const financialsChartData = useMemo(() => {
    return [
      { name: 'Revenue', Value: dashboardStats.totalSales },
      { name: 'COGS', Value: dashboardStats.totalCogs },
      { name: 'Expenses', Value: dashboardStats.totalExpenses },
      { name: 'Net Profit', Value: dashboardStats.netProfit }
    ];
  }, [dashboardStats]);

  // Expenses Pie Chart data
  const expensesPieData = useMemo(() => {
    const cats = {};
    filteredExpenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    const colors = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
    return Object.entries(cats).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    }));
  }, [filteredExpenses]);

  const rechartsTooltipStyle = {
    backgroundColor: 'rgba(7, 11, 18, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    color: '#f8fafc',
    fontSize: '11px',
    padding: '8px 12px'
  };

  // Find most low-stocked items to show in the widget
  const criticalProducts = useMemo(() => {
    return products
      .map(p => {
        const totalQty = p.batches.reduce((sum, b) => sum + Number(b.quantity), 0);
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
          <h1 className="text-2xl font-bold tracking-tight">
            {isAdmin ? 'Admin Command Center' : 'Sales Command Center'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isAdmin ? 'Real-time performance analytics for your agro-chemical shop' : 'Daily sales overview and stock tracking'}
          </p>
        </div>
        {isAdmin && (
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
        )}
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Gross Revenue */}
        <div className="bg-gradient-to-br from-emerald-50/40 to-emerald-100/30 dark:from-slate-950 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 p-5 rounded-2xl shadow-sm hover:border-emerald-400 dark:hover:border-emerald-700/80 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isAdmin ? 'Gross Revenue' : 'Revenue for the Day'}
            </span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-3.5">
            GHS {dashboardStats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
            From {dashboardStats.salesCount} completed sales
          </p>
        </div>

        {/* Total Expenses */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-rose-50/40 to-rose-100/30 dark:from-slate-950 dark:to-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 p-5 rounded-2xl shadow-sm hover:border-rose-400 dark:hover:border-rose-700/80 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Expenses</span>
              <span className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-3.5">
              GHS {dashboardStats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
              Logged business expenses
            </p>
          </div>
        )}

        {/* Net Profit */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-blue-50/40 to-blue-100/30 dark:from-slate-950 dark:to-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 p-5 rounded-2xl shadow-sm hover:border-blue-400 dark:hover:border-blue-700/80 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Profit</span>
              <span className={`p-1.5 rounded-lg ${dashboardStats.netProfit >= 0 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <h3 className={`text-xl font-bold mt-3.5 ${dashboardStats.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
              GHS {dashboardStats.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
              Margin: {dashboardStats.totalSales > 0 ? ((dashboardStats.netProfit / dashboardStats.totalSales) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        )}

        {/* Outstanding Debtors */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-white to-indigo-50/25 dark:from-slate-950 dark:to-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/50 p-5 rounded-2xl shadow-sm hover:border-indigo-400 dark:hover:border-indigo-700/80 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Debtors Credit</span>
              <span className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-3.5">
              GHS {dashboardStats.totalOutstandingCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
              Overall outstanding shop debts
            </p>
          </div>
        )}

        {/* Low Stock count */}
        <div className="bg-gradient-to-br from-white to-amber-50/25 dark:from-slate-950 dark:to-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 p-5 rounded-2xl shadow-sm hover:border-amber-400 dark:hover:border-amber-700/80 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Low Stock Alerts</span>
            <span className={`p-1.5 rounded-lg ${dashboardStats.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <h3 className={`text-xl font-bold mt-3.5 ${dashboardStats.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {dashboardStats.lowStockCount} Products
          </h3>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
            Below safe reorder counts
          </p>
        </div>

        {/* Expiring Batches */}
        <div className="bg-gradient-to-br from-white to-fuchsia-50/25 dark:from-slate-950 dark:to-fuchsia-950/20 border border-fuchsia-200/80 dark:border-fuchsia-900/50 p-5 rounded-2xl shadow-sm hover:border-fuchsia-400 dark:hover:border-fuchsia-700/80 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Expiry Warnings</span>
            <span className={`p-1.5 rounded-lg ${dashboardStats.expiringSoonCount > 0 ? 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <h3 className={`text-xl font-bold mt-3.5 ${dashboardStats.expiringSoonCount > 0 ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-slate-800 dark:text-slate-200'}`}>
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

      {/* P&L and Expense Breakdown row */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Financial Bar Chart */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-2 lg:col-span-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Profit & Loss visual breakdown</h3>
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialsChartData} margin={{ left: -10, right: 10, top: 15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `GHS ${v}`} />
                  <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} contentStyle={rechartsTooltipStyle} formatter={(val) => [`GHS ${val.toLocaleString()}`, 'Value']} />
                  <Bar dataKey="Value" radius={[6, 6, 0, 0]}>
                    {financialsChartData.map((entry, index) => {
                      const colors = ['#10b981', '#64748b', '#f43f5e', '#3b82f6'];
                      return <Cell key={`cell-${index}`} fill={colors[index]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recharts Expenses Category Pie Chart */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between lg:col-span-1">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center">
              <PieIcon className="w-4.5 h-4.5 text-rose-500 mr-2" />
              <span>Shop Expenses Share</span>
            </h3>
            {expensesPieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs">
                <span>No expenses categorized.</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                <div className="h-40 w-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expensesPieData} innerRadius={45} outerRadius={60} paddingAngle={2} dataKey="value">
                        {expensesPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={rechartsTooltipStyle} formatter={(val) => `GHS ${val}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-start text-[10px] font-bold overflow-y-auto max-h-[140px] pr-1">
                  {expensesPieData.map((entry, i) => (
                    <div key={i} className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-slate-500 dark:text-slate-450 truncate max-w-[80px]">{entry.name}</span>
                      <span className="text-slate-705 dark:text-slate-300 font-mono">({((entry.value / dashboardStats.totalExpenses) * 100).toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
