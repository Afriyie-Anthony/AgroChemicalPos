import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';
import { 
  useExpenses, 
  useCreateExpense, 
  useUpdateExpense, 
  useDeleteExpense 
} from '../../hooks/useExpenses';
import { useStaffList } from '../../hooks/useStaff';

const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  momo: 'Mobile Money',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque'
};

const PAYMENT_METHOD_ICONS = {
  cash: Banknote,
  momo: Smartphone,
  bank_transfer: CreditCard,
  cheque: FileText
};

export default function Expenses() {
  const { expenseCategories, currentUser, showAlert } = useStore();
  const { data: expenses = [], isLoading } = useExpenses({});
  const { data: staffList = [] } = useStaffList();
  const { mutateAsync: createExpenseApi } = useCreateExpense();
  const { mutateAsync: updateExpenseApi } = useUpdateExpense();
  const { mutateAsync: deleteExpenseApi } = useDeleteExpense();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Form State
  const emptyForm = {
    description: '',
    category: expenseCategories[0] || '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: currentUser?.name || '',
    paymentMethod: 'cash',
    reference: '',
    notes: ''
  };
  const [formData, setFormData] = useState(emptyForm);

  // Derived data: available months from expenses
  const availableMonths = useMemo(() => {
    const months = new Set();
    expenses.forEach(e => {
      const d = new Date(e.date);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months).sort().reverse();
  }, [expenses]);

  // Filtered & sorted expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.paidBy.toLowerCase().includes(q) ||
        (e.reference && e.reference.toLowerCase().includes(q))
      );
    }

    if (filterCategory !== 'All') {
      result = result.filter(e => e.category === filterCategory);
    }

    if (filterMonth !== 'All') {
      result = result.filter(e => {
        const d = new Date(e.date);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === filterMonth;
      });
    }

    result.sort((a, b) => {
      let valA, valB;
      if (sortField === 'date') {
        valA = new Date(a.date);
        valB = new Date(b.date);
      } else if (sortField === 'amount') {
        valA = Number(a.amount);
        valB = Number(b.amount);
      } else if (sortField === 'category') {
        valA = a.category;
        valB = b.category;
      } else {
        valA = a.description.toLowerCase();
        valB = b.description.toLowerCase();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [expenses, searchQuery, filterCategory, filterMonth, sortField, sortDir]);

  // Summary statistics
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    let totalAll = 0;
    let totalThisMonth = 0;
    let totalLastMonth = 0;
    const categoryTotals = {};

    expenses.forEach(e => {
      const amount = Number(e.amount);
      totalAll += amount;
      const d = new Date(e.date);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (mKey === thisMonth) totalThisMonth += amount;
      if (mKey === lastMonth) totalLastMonth += amount;

      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amount;
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const monthChange = totalLastMonth > 0
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth * 100).toFixed(1)
      : totalThisMonth > 0 ? 100 : 0;

    return {
      totalAll,
      totalThisMonth,
      totalLastMonth,
      monthChange: Number(monthChange),
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      count: expenses.length
    };
  }, [expenses]);

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData(emptyForm);
    setShowAddModal(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      category: expense.category,
      amount: String(expense.amount),
      date: expense.date,
      paidBy: expense.paidBy,
      paymentMethod: expense.paymentMethod,
      reference: expense.reference || '',
      notes: expense.notes || ''
    });
    setShowAddModal(true);
  };

  const openViewModal = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const openDeleteModal = (expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    try {
      if (editingExpense) {
        await updateExpenseApi({ id: editingExpense.id, data: payload });
        showAlert('Expense updated successfully', 'success', 'Success');
      } else {
        await createExpenseApi(payload);
        showAlert('Expense recorded successfully', 'success', 'Success');
      }
      setShowAddModal(false);
      setEditingExpense(null);
      setFormData(emptyForm);
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to save expense', 'error', 'Error');
    }
  };

  const handleDelete = async () => {
    if (selectedExpense) {
      try {
        await deleteExpenseApi(selectedExpense.id);
        showAlert('Expense deleted successfully', 'success', 'Success');
        setShowDeleteModal(false);
        setSelectedExpense(null);
      } catch (error) {
        showAlert(error.response?.data?.message || 'Failed to delete expense', 'error', 'Error');
      }
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return new Date(year, parseInt(month) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Utilities': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      'Transport & Logistics': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      'Rent': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      'Maintenance & Repairs': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      'Staff Welfare': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      'Marketing & Advertising': 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      'Office Supplies': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      'Insurance': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      'Taxes & Levies': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      'Miscellaneous': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
    };
    return colors[category] || colors['Miscellaneous'];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            Expense Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">Track and manage all business expenses</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          Record Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5 text-rose-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">GHS {stats.totalAll.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stats.count} expense records</p>
        </div>

        {/* This Month */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">This Month</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">GHS {stats.totalThisMonth.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-1">
            {stats.monthChange >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span className={`text-xs font-semibold ${stats.monthChange >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {Math.abs(stats.monthChange)}% vs last month
            </span>
          </div>
        </div>

        {/* Last Month */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Month</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Receipt className="w-4.5 h-4.5 text-violet-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">GHS {stats.totalLastMonth.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Previous period total</p>
        </div>

        {/* Top Category */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Category</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-amber-500" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-800 dark:text-white truncate">{stats.topCategory?.name || '—'}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {stats.topCategory ? `GHS ${stats.topCategory.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}` : 'No data'}
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {expenseCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Months</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonthLabel(m)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th
                  className="cursor-pointer select-none hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1.5">
                    Date
                    <ArrowUpDown className={`w-3 h-3 ${sortField === 'date' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                </th>
                <th
                  className="cursor-pointer select-none hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center gap-1.5">
                    Description
                    <ArrowUpDown className={`w-3 h-3 ${sortField === 'description' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                </th>
                <th
                  className="cursor-pointer select-none hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1.5">
                    Category
                    <ArrowUpDown className={`w-3 h-3 ${sortField === 'category' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                </th>
                <th
                  className="cursor-pointer select-none hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-right"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Amount
                    <ArrowUpDown className={`w-3 h-3 ${sortField === 'amount' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                </th>
                <th>Paid By</th>
                <th>Method</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                      <Wallet className="w-12 h-12 opacity-30" />
                      <p className="font-semibold">No expenses found</p>
                      <p className="text-xs">Try adjusting your filters or record a new expense</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(expense => {
                  const PayIcon = PAYMENT_METHOD_ICONS[expense.paymentMethod] || Banknote;
                  return (
                    <tr key={expense.id} className="group">
                      <td>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(expense.date)}</span>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[250px]">{expense.description}</p>
                          {expense.reference && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">Ref: {expense.reference}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          GHS {Number(expense.amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{expense.paidBy}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <PayIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {PAYMENT_METHOD_LABELS[expense.paymentMethod] || expense.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openViewModal(expense)}
                            title="View Details"
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(expense)}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(expense)}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {filteredExpenses.length > 0 && (
          <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              Total: GHS {filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* ============ ADD / EDIT MODAL ============ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editingExpense ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                  {editingExpense ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                </div>
                {editingExpense ? 'Edit Expense' : 'Record New Expense'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setEditingExpense(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Electricity bill - June 2026"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {expenseCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Amount (GHS) *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Date & Paid By */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Paid By *</label>
                  <select
                    required
                    value={formData.paidBy}
                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method & Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Payment Method *</label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="momo">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Receipt / Ref #"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details about this expense..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingExpense(null); }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.97]"
                >
                  {editingExpense ? 'Update Expense' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ VIEW DETAILS MODAL ============ */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                Expense Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              {/* Amount Highlight */}
              <div className="text-center py-4 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-500/5 dark:to-orange-500/5 rounded-xl border border-rose-200/50 dark:border-rose-500/10">
                <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">Amount</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">GHS {Number(selectedExpense.amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
              </div>

              {/* Info Grid */}
              <div className="space-y-3">
                {[
                  { label: 'Description', value: selectedExpense.description },
                  { label: 'Category', value: selectedExpense.category, isBadge: true },
                  { label: 'Date', value: formatDate(selectedExpense.date) },
                  { label: 'Paid By', value: selectedExpense.paidBy },
                  { label: 'Payment Method', value: PAYMENT_METHOD_LABELS[selectedExpense.paymentMethod] || selectedExpense.paymentMethod },
                  { label: 'Reference', value: selectedExpense.reference || '—' },
                  { label: 'Notes', value: selectedExpense.notes || '—' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-700/30 last:border-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[110px]">{item.label}</span>
                    {item.isBadge ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getCategoryColor(item.value)}`}>
                        {item.value}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedExpense);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-semibold transition-colors border border-amber-500/20"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openDeleteModal(selectedExpense);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold transition-colors border border-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      {showDeleteModal && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delete Expense?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  This will permanently remove <strong className="text-slate-700 dark:text-slate-300">"{selectedExpense.description}"</strong> (GHS {Number(selectedExpense.amount).toFixed(2)}).
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/20 transition-all active:scale-[0.97]"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
