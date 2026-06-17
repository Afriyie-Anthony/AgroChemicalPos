import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useProductList } from '../../hooks/useProduct';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  TrendingUp, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Boxes, 
  Receipt,
  AlertCircle,
  CreditCard,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function Reports() {
  const { transactions, purchaseOrders, adjustments, expenses, staffList, customers } = useStore();
  const { data: products = [] } = useProductList();
  const [activeTab, setActiveTab] = useState('financials'); 
  // Tabs: 'financials', 'tax', 'inventory', 'debtors', 'staff', 'movement'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  // ==========================================
  // DATE FILTERING HELPER FOR TRANSACTIONS
  // ==========================================
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

  // ==========================================
  // DATE FILTERING HELPER FOR EXPENSES
  // ==========================================
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (dateFilter === 'all') return true;
      const date = new Date(e.date);
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
  }, [expenses, dateFilter]);

  // ==========================================
  // 1. FINANCIALS (P&L) CALCULATION
  // ==========================================
  const financialData = useMemo(() => {
    let grossRevenue = 0;
    let totalCogs = 0;
    let paymentBreakdown = { cash: 0, momo: 0, card: 0, credit: 0 };

    filteredTransactions.forEach(t => {
      grossRevenue += t.total;
      
      if (t.paymentMethod === 'cash') paymentBreakdown.cash += t.total;
      else if (t.paymentMethod === 'momo') paymentBreakdown.momo += t.total;
      else if (t.paymentMethod === 'card') paymentBreakdown.card += t.total;
      else if (t.paymentMethod === 'credit') paymentBreakdown.credit += t.total;
      
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
      paymentBreakdown
    };
  }, [filteredTransactions, products]);

  // Expenses summary
  const expensesTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const netProfit = financialData.grossProfit - expensesTotal;
  const netMargin = financialData.grossRevenue > 0 ? (netProfit / financialData.grossRevenue) * 100 : 0;

  // Financial Chart Data (Revenue, COGS, Expenses, Net Profit)
  const financialsChartData = useMemo(() => {
    return [
      { name: 'Revenue', Value: financialData.grossRevenue },
      { name: 'COGS', Value: financialData.totalCogs },
      { name: 'Expenses', Value: expensesTotal },
      { name: 'Net Profit', Value: netProfit }
    ];
  }, [financialData, expensesTotal, netProfit]);

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


  // ==========================================
  // 3. INVENTORY & ASSETS CALCULATION
  // ==========================================
  const inventoryStats = useMemo(() => {
    let totalQty = 0;
    let assetValueCost = 0;
    let assetValueRetail = 0;
    let lowStockCount = 0;

    products.forEach(p => {
      const prodQty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
      totalQty += prodQty;

      if (prodQty <= p.reorderLevel) {
        lowStockCount++;
      }

      p.batches.forEach(b => {
        assetValueCost += (b.quantity * (b.purchasePrice || p.costPrice));
        assetValueRetail += (b.quantity * p.retailPrice);
      });
    });

    const unrealizedMargin = assetValueRetail - assetValueCost;

    // FEFO Near Expiry Checklist
    const expiringSoon = [];
    const now = new Date();
    products.forEach(p => {
      p.batches.forEach(b => {
        const exp = new Date(b.expiryDate);
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 180 && diffDays > 0) {
          expiringSoon.push({
            id: b.id,
            productName: p.name,
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            expiryDate: b.expiryDate,
            daysLeft: diffDays
          });
        }
      });
    });

    expiringSoon.sort((a, b) => a.daysLeft - b.daysLeft);

    // Filter low stock
    const lowStockItems = products
      .map(p => {
        const qty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
        return { ...p, currentQty: qty };
      })
      .filter(p => p.currentQty <= p.reorderLevel);

    return {
      totalQty,
      assetValueCost,
      assetValueRetail,
      unrealizedMargin,
      lowStockCount,
      expiringSoon,
      lowStockItems
    };
  }, [products]);

  // Category wise Cost vs Retail asset value
  const inventoryCategoryData = useMemo(() => {
    const cats = {};
    products.forEach(p => {
      const prodCost = p.batches.reduce((sum, b) => sum + (b.quantity * (b.purchasePrice || p.costPrice)), 0);
      const prodRetail = p.batches.reduce((sum, b) => sum + (b.quantity * p.retailPrice), 0);
      
      cats[p.category] = cats[p.category] || { cost: 0, retail: 0 };
      cats[p.category].cost += prodCost;
      cats[p.category].retail += prodRetail;
    });

    return Object.entries(cats).map(([name, val]) => ({
      name,
      Cost: val.cost,
      Retail: val.retail
    }));
  }, [products]);

  // ==========================================
  // 4. DEBTORS & CREDITS SUMMARY
  // ==========================================
  const debtorsData = useMemo(() => {
    const activeDebtors = customers.filter(c => c.outstandingCredit > 0);
    const totalOutstanding = activeDebtors.reduce((sum, c) => sum + c.outstandingCredit, 0);
    const totalLimitPool = customers.reduce((sum, c) => sum + c.creditLimit, 0);
    const bufferAvailable = totalLimitPool - totalOutstanding;

    return {
      list: activeDebtors,
      totalOutstanding,
      totalLimitPool,
      bufferAvailable,
      count: activeDebtors.length
    };
  }, [customers]);

  // Top Debtors outstanding vs limit data
  const debtorsChartData = useMemo(() => {
    return debtorsData.list
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        Owed: c.outstandingCredit,
        Limit: c.creditLimit
      }));
  }, [debtorsData]);

  // ==========================================
  // 5. STAFF PERFORMANCE CALCULATION
  // ==========================================
  const staffPerformance = useMemo(() => {
    return staffList.map(staff => {
      const staffTrx = filteredTransactions.filter(t => t.cashierId === staff.id);
      const salesCount = staffTrx.length;
      const totalRevenue = staffTrx.reduce((sum, t) => sum + t.total, 0);

      return {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        phone: staff.phone,
        salesCount,
        totalRevenue
      };
    });
  }, [staffList, filteredTransactions]);

  // Staff billing bar chart data
  const staffChartData = useMemo(() => {
    return staffPerformance.map(s => ({
      name: s.name,
      Revenue: s.totalRevenue
    }));
  }, [staffPerformance]);

  // ==========================================
  // 6. STOCK MOVEMENT LEDGER (AUDIT LEDGER)
  // ==========================================
  const stockMovements = useMemo(() => {
    const movements = [];

    // 1. Sales Logs (Decrease stock / Restock if voided)
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
            date: po.receivedAt || po.createdAt,
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

    // 3. Manual Stock Adjustments Logs
    (adjustments || []).forEach(adj => {
      if (adj.reason === 'sale' || adj.reason === 'void') return;

      const qty = Math.abs(adj.quantityChange);
      const direction = adj.quantityChange < 0 ? 'out' : 'in';
      const reasonLabels = {
        damage: 'Spillage / Damage',
        theft: 'Theft / Write-off',
        'count correction': 'Count Correction',
        'promotional give-away': 'Promo Giveaway'
      };

      movements.push({
        id: adj.id,
        date: adj.date,
        type: direction,
        typeLabel: `Adjustment (${reasonLabels[adj.reason] || adj.reason})`,
        productName: adj.productName,
        quantity: qty,
        unit: 'Units',
        batchNumber: adj.batchNumber,
        reference: 'INV-ADJ',
        user: adj.user
      });
    });

    return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, purchaseOrders, adjustments]);

  // ==========================================
  // DYNAMIC CSV EXPORT GENERATOR
  // ==========================================
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `AgroChem_${activeTab}_report_${dateFilter}.csv`;

    if (activeTab === 'financials') {
      headers = ['Metric Name', 'Value (GHS)'];
      rows = [
        ['Gross Sales Revenue', financialData.grossRevenue.toFixed(2)],
        ['Cost of Goods Sold (COGS)', financialData.totalCogs.toFixed(2)],
        ['Gross Profit', financialData.grossProfit.toFixed(2)],
        ['Total Shop Expenses', expensesTotal.toFixed(2)],
        ['Net Store Profit', netProfit.toFixed(2)],
        ['Gross Profit Margin (%)', `${financialData.profitMargin.toFixed(1)}%`],
        ['Net Profit Margin (%)', `${netMargin.toFixed(1)}%`],
        ['Cash Sales Collected', financialData.paymentBreakdown.cash.toFixed(2)],
        ['Mobile Money (MoMo) Sales', financialData.paymentBreakdown.momo.toFixed(2)],
        ['Card Sales Swipe', financialData.paymentBreakdown.card.toFixed(2)],
        ['Outstanding Customer Credit', financialData.paymentBreakdown.credit.toFixed(2)]
      ];
    } else if (activeTab === 'inventory') {
      headers = ['Product Name', 'Remaining Stock', 'Reorder Level', 'Status'];
      rows = products.map(p => {
        const qty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
        return [
          p.name,
          qty,
          p.reorderLevel,
          qty <= p.reorderLevel ? 'Low Stock' : 'Good Stock'
        ];
      });
    } else if (activeTab === 'debtors') {
      headers = ['Customer Name', 'Phone Hotline', 'Customer Segment', 'Credit Limit (GHS)', 'Outstanding Credit (GHS)', 'Available Buffer (GHS)'];
      rows = customers.map(c => [
        c.name,
        c.phone,
        c.segment,
        c.creditLimit.toFixed(2),
        c.outstandingCredit.toFixed(2),
        (c.creditLimit - c.outstandingCredit).toFixed(2)
      ]);
    } else if (activeTab === 'staff') {
      headers = ['Staff Personnel', 'Role Profile', 'Sales Made', 'Revenue Generated (GHS)'];
      rows = staffPerformance.map(s => [
        s.name,
        s.role.toUpperCase(),
        s.salesCount,
        s.totalRevenue.toFixed(2)
      ]);
    } else if (activeTab === 'movement') {
      headers = ['Date/Time', 'Event Descriptor', 'Product Brand/Name', 'Batch Tag', 'Stock Flow', 'Doc Code', 'Staff Operator'];
      rows = stockMovements.map(m => [
        new Date(m.date).toLocaleString('en-GB'),
        m.typeLabel,
        m.productName,
        m.batchNumber,
        `${m.type === 'in' ? '+' : '-'}${m.quantity} ${m.unit}`,
        m.reference,
        m.user
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rechartsTooltipStyle = {
    backgroundColor: 'rgba(7, 11, 18, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    color: '#f8fafc',
    fontSize: '11px',
    padding: '8px 12px'
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Reports & Auditing</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify revenues, gross profit margins, statutory GRA taxes, and inventory ledger checks</p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (CSV)</span>
          </button>
          
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:outline-none text-slate-700 dark:text-slate-355 cursor-pointer"
            >
              <option value="all">All-Time Performance</option>
              <option value="today">Today's Transactions</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1.5 border-b border-slate-200 dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-800">
        {[
          { id: 'financials', label: 'Financials P&L', icon: TrendingUp },
          { id: 'inventory', label: 'Inventory Assets', icon: Boxes },
          { id: 'debtors', label: 'Debtors & Credit', icon: CreditCard },
          { id: 'staff', label: 'Staff Performance', icon: UserCheck },
          { id: 'movement', label: 'Stock Flow Audit', icon: Receipt }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap focus:outline-none ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: FINANCIAL OVERVIEW
          ======================================================== */}
      {activeTab === 'financials' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm relative overflow-hidden">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Gross Sales Revenue</span>
              <h3 className="text-xl font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">
                {formatCurrency(financialData.grossRevenue)}
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">From {filteredTransactions.length} sales</p>
            </div>
            
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Cost of Goods Sold (COGS)</span>
              <h3 className="text-xl font-bold mt-1.5 text-slate-700 dark:text-slate-200">
                {formatCurrency(financialData.totalCogs)}
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Wholesale value of goods cleared</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Gross Profit</span>
              <h3 className={`text-xl font-bold mt-1.5 ${financialData.grossProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatCurrency(financialData.grossProfit)}
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Margin: {financialData.profitMargin.toFixed(1)}%</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Total Shop Expenses</span>
              <h3 className="text-xl font-bold mt-1.5 text-rose-500">
                {formatCurrency(expensesTotal)}
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Logged business expenses</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Net Profit Summary */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Net Business Profit</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Gross profit minus active operational expenses</p>
              </div>
              
              <div className="py-4">
                <h2 className={`text-3xl font-bold tracking-tight ${netProfit >= 0 ? 'text-blue-500' : 'text-rose-500'}`}>
                  {formatCurrency(netProfit)}
                </h2>
                <div className="flex items-center space-x-1.5 mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {netProfit >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {netMargin.toFixed(1)}% Net Margin
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal border-t border-slate-100 dark:border-slate-900 pt-3">
                Calculations adjust based on calendar filters. Ensure all utility, rental, and fuel costs are compiled in the Expenses page.
              </div>
            </div>

            {/* Recharts Financial Bar Chart */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-2 lg:col-span-2">
              <h3 className="font-bold text-sm text-slate-850 dark:text-slate-205">P&L Account Visual Breakdown</h3>
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Payment Channels Table & Info */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-205">Sales Payment Breakdown</h3>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Cash Sales</span>
                  <span className="font-bold">{formatCurrency(financialData.paymentBreakdown.cash)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Mobile Money (MoMo)</span>
                  <span className="font-bold">{formatCurrency(financialData.paymentBreakdown.momo)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Card Payments</span>
                  <span className="font-bold">{formatCurrency(financialData.paymentBreakdown.card)}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-900 pt-2">
                  <span className="text-slate-400 font-medium">Outstanding Customer Credit</span>
                  <span className="font-bold text-rose-500">{formatCurrency(financialData.paymentBreakdown.credit)}</span>
                </div>
              </div>
            </div>

            {/* Recharts Expenses Category Pie Chart */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center">
                <PieIcon className="w-4.5 h-4.5 text-rose-500 mr-2" />
                <span>Shop Expenses Share</span>
              </h3>
              {expensesPieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-450 text-xs">
                  <span>No expenses categorized.</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-44 w-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expensesPieData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                          {expensesPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={rechartsTooltipStyle} formatter={(val) => `GHS ${val}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5 text-[10px] w-full max-h-40 overflow-y-auto pr-1">
                    {expensesPieData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 truncate max-w-[120px]">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-450 font-bold truncate">{item.name}</span>
                        </div>
                        <span className="font-bold font-mono">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: INVENTORY VALUATION & EXPIRY
          ======================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Asset Value (Cost)</span>
              <h3 className="text-xl font-bold mt-1.5 text-slate-855 dark:text-slate-105">
                {formatCurrency(inventoryStats.assetValueCost)}
              </h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Capital locked in warehouses</p>
            </div>
            
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Asset Value (Retail)</span>
              <h3 className="text-xl font-bold mt-1.5 text-slate-855 dark:text-slate-105">
                {formatCurrency(inventoryStats.assetValueRetail)}
              </h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Total potential sales revenue</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Unrealized Gross Margin</span>
              <h3 className="text-xl font-bold mt-1.5 text-emerald-500">
                {formatCurrency(inventoryStats.unrealizedMargin)}
              </h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Potential asset earnings margin</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Stock Level Alerts</span>
              <h3 className="text-xl font-bold mt-1.5 text-amber-500">
                {inventoryStats.lowStockCount} Products
              </h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Items at or below reorder limit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Asset Categories Cost vs Retail */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-2 lg:col-span-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Asset Valuation by Category</h3>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryCategoryData} margin={{ left: -10, right: 10, top: 15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `GHS ${v}`} />
                    <Tooltip contentStyle={rechartsTooltipStyle} formatter={(val) => `GHS ${val.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Bar dataKey="Cost" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Retail" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* FEFO Expiry Alarms summary */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-1">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center">
                <Clock className="w-4.5 h-4.5 text-rose-500 mr-2" />
                <span>Expiry FEFO Alarm List</span>
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-900 overflow-y-auto max-h-[220px] pr-1">
                {inventoryStats.expiringSoon.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-450">No batches expiring soon</div>
                ) : (
                  inventoryStats.expiringSoon.slice(0, 5).map((b, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-750 dark:text-slate-250 truncate max-w-[130px]">{b.productName}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">Batch: {b.batchNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${b.daysLeft < 60 ? 'text-rose-500' : 'text-amber-500'}`}>{b.daysLeft} days left</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{b.quantity} units left</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: DEBTORS & CREDIT ACCOUNTS
          ======================================================== */}
      {activeTab === 'debtors' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Total Debt Outstanding</span>
              <h3 className="text-xl font-bold mt-1.5 text-rose-500">
                {formatCurrency(debtorsData.totalOutstanding)}
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Accrued credit balances</p>
            </div>
            
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Active Shop Debtors</span>
              <h3 className="text-xl font-bold mt-1.5 text-slate-800 dark:text-slate-100">
                {debtorsData.count} Customers
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Unresolved credits</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Total Credit Pool Limit</span>
              <h3 className="text-xl font-bold mt-1.5 text-slate-800 dark:text-slate-100">
                {formatCurrency(debtorsData.totalLimitPool)}
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Max risk allowed across store</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Available Credit Buffer</span>
              <h3 className="text-xl font-bold mt-1.5 text-emerald-500">
                {formatCurrency(debtorsData.bufferAvailable)}
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Residual credit allowance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Debtors visualizer bar chart */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-2 lg:col-span-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Risk Profile: Top Debtors Outstanding Owed vs Limit</h3>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={debtorsChartData} margin={{ left: -10, right: 10, top: 15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={rechartsTooltipStyle} formatter={(val) => `GHS ${val.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Bar dataKey="Limit" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Owed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Debtors List short summary */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-1">
              <h3 className="font-bold text-sm text-slate-805 dark:text-slate-205">Outstanding Balance Ledger</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-900 overflow-y-auto max-h-[220px] pr-1">
                {debtorsData.list.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No debts outstanding.</div>
                ) : (
                  debtorsData.list.slice(0, 5).map((c, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-750 dark:text-slate-250 truncate max-w-[130px]">{c.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{c.segment}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-rose-500 font-mono">{formatCurrency(c.outstandingCredit)}</p>
                        <p className="text-[9px] text-slate-400">Limit: GHS {c.creditLimit.toFixed(0)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: STAFF SALES PERFORMANCE
          ======================================================== */}
      {activeTab === 'staff' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Staff Count</span>
              <h3 className="text-xl font-bold mt-1.5 text-slate-800 dark:text-slate-100">{staffList.length} Operators</h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Active registered personnel</p>
            </div>
            
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Total Sales Completed</span>
              <h3 className="text-xl font-bold mt-1.5 text-emerald-500">
                {staffPerformance.reduce((sum, s) => sum + s.salesCount, 0)} checkouts
              </h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Transactions handled in period</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider block">Top Performer</span>
              <h3 className="text-xl font-bold mt-1.5 text-blue-500">
                {staffPerformance.length > 0 
                  ? staffPerformance.reduce((prev, current) => (prev.totalRevenue > current.totalRevenue) ? prev : current).name 
                  : 'N/A'
                }
              </h3>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">Highest cashier billing in period</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Staff Billing Chart */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-2 lg:col-span-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Staff Sales Revenue Breakdown</h3>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffChartData} margin={{ left: -10, right: 10, top: 15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={rechartsTooltipStyle} formatter={(val) => `GHS ${val.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance table */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-1">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Staff Sales Breakdown</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-900 overflow-y-auto max-h-[220px] pr-1">
                {staffPerformance.map((s, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-350">{s.name}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Role: {s.role.toUpperCase()} | Sales: {s.salesCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-500 font-mono">{formatCurrency(s.totalRevenue)}</p>
                      <p className="text-[9px] text-slate-400">Avg: {formatCurrency(s.totalRevenue / (s.salesCount || 1))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: STOCK LEDGER FLOW AUDIT
          ======================================================== */}
      {activeTab === 'movement' && (
        <div className="space-y-4 animate-in fade-in duration-150">
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
                  <th>Date</th>
                  <th>Movement Type</th>
                  <th>Product Description</th>
                  <th>Batch Number</th>
                  <th className="text-right">Quantity</th>
                  <th>Reference</th>
                  <th>Logged By</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.map(mov => (
                  <tr key={mov.id}>
                    <td className="text-slate-500 font-medium">{new Date(mov.date).toLocaleString('en-GB')}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${
                        mov.type === 'in'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}>
                        {mov.typeLabel}
                      </span>
                    </td>
                    <td className="font-bold text-slate-750 dark:text-slate-250">{mov.productName}</td>
                    <td className="font-mono text-slate-500">{mov.batchNumber}</td>
                    <td className={`text-right font-bold ${
                      mov.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}>
                      {mov.type === 'in' ? '+' : '-'}{mov.quantity} {mov.unit}
                    </td>
                    <td className="font-mono font-semibold text-slate-600 dark:text-slate-400">{mov.reference}</td>
                    <td className="font-medium text-slate-500">{mov.user}</td>
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
