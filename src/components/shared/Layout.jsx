import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Boxes,
  Truck,
  ClipboardList,
  Users,
  CreditCard,
  BarChart3,
  UserCheck,
  Settings,
  Sun,
  Moon,
  MapPin,
  Menu,
  X,
  Sprout,
  ChevronRight
} from 'lucide-react';

export default function Layout({ children }) {
  const { currentUser, activeShift, logout, theme, toggleTheme, products, customers } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic Badge Calculations
  const lowStockCount = useMemo(() => {
    return products.filter(p => {
      const totalQty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
      return totalQty <= p.reorderLevel;
    }).length;
  }, [products]);

  const creditAccountCount = useMemo(() => {
    return customers.filter(c => c.outstandingCredit > 0).length;
  }, [customers]);

  // Sidebar Menu Categorized Configuration
  const menuSections = [
    {
      title: 'MAIN',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/sales/pos', label: 'Sales POS', icon: ShoppingCart },
        { path: '/admin/transactions', label: 'Transactions', icon: Receipt },
      ]
    },
    {
      title: 'INVENTORY',
      items: [
        { path: '/admin/products', label: 'Products', icon: PackagesIcon, badge: lowStockCount },
        { path: '/admin/stock', label: 'Stock Control', icon: Boxes },
        { path: '/admin/suppliers', label: 'Suppliers', icon: Truck },
        { path: '/admin/purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
      ]
    },
    {
      title: 'BUSINESS',
      items: [
        { path: '/admin/customers', label: 'Customers', icon: Users },
        { path: '/admin/credit', label: 'Credit Accounts', icon: CreditCard, badge: creditAccountCount },
        { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
      ]
    },
    {
      title: 'ADMIN',
      items: [
        { path: '/admin/staff', label: 'Staff & Access', icon: UserCheck },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  // Helper custom icon wrapper for Products category
  function PackagesIcon(props) {
    return <Package {...props} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      
      {/* Sidebar - Desktop and mobile sliding */}
      <aside className={`fixed inset-y-0 left-0 z-20 flex flex-col w-64 bg-[#232323] border-r border-[#2d2d2d] text-slate-300 transition-transform duration-300 transform md:translate-x-0 md:relative ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2d2d2d]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
              <Sprout className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">AgroChem POS</h1>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-1 inline-block">Admin Panel</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-200 md:hidden focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 py-5 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <h4 className="px-4 text-[9px] font-bold text-slate-550 tracking-widest uppercase">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item, iIdx) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={iIdx}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-150 text-xs font-semibold group ${
                        isActive
                          ? 'bg-[#edf7f2] text-[#0a6c3f] shadow-sm'
                          : 'text-slate-400 hover:bg-[#2d2d2d]/50 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#0a6c3f]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span>{item.label}</span>
                      </div>
                      
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isActive 
                            ? 'bg-[#0a6c3f] text-white' 
                            : item.label === 'Products' 
                              ? 'bg-[#fbf4eb] text-[#c084fc] dark:bg-amber-500/10 dark:text-amber-400' 
                              : 'bg-[#edf7f2] text-[#0a6c3f]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile Card Footer */}
        <div className="p-4 border-t border-[#2d2d2d] bg-[#1a1a1a]/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#2d2d2d]/60 transition-colors duration-150 text-left focus:outline-none group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700/80 border border-emerald-600/30 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                KA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white truncate group-hover:text-emerald-400 transition-colors">Kwame Asante</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">Administrator</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 shadow-sm transition-colors duration-200">
          {/* Left Panel Menu Trigger */}
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 md:hidden focus:outline-none rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">Nsawam Main Store</h2>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">Eastern Region, Ghana</span>
              </div>
            </div>
          </div>

          {/* Right Panel Toggles */}
          <div className="flex items-center space-x-4">
            {/* Theme selector */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all active:scale-95 border border-slate-200 dark:border-slate-800 focus:outline-none"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </button>

            {/* Shift Indicators */}
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-inner">
              <span className={`w-2 h-2 rounded-full ${activeShift ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Shift: {activeShift ? 'OPEN' : 'CLOSED'}
              </span>
              {activeShift && (
                <span className="hidden md:inline text-[10px] text-slate-400 dark:text-slate-500 font-medium border-l border-slate-200 dark:border-slate-700 pl-2">
                  Float: GHS {activeShift.openingFloat.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={() => navigate('/sales/shift')}
              className={`text-xs px-3.5 py-1.5 font-semibold rounded-lg transition-all shadow-sm ${
                activeShift
                  ? 'bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
              }`}
            >
              {activeShift ? 'Manage Shift' : 'Open Shift'}
            </button>
          </div>
        </header>

        {/* Actual page layout */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none p-6 text-slate-800 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
