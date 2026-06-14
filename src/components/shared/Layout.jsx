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
  ChevronRight,
  Bell
} from 'lucide-react';

export default function Layout({ children }) {
  const { currentUser, activeShift, logout, theme, toggleTheme, products, customers } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <aside className={`fixed inset-y-0 left-0 z-20 flex flex-col bg-[#f8fafc] dark:bg-[#070B12] text-slate-600 dark:text-slate-300 transition-all duration-300 transform md:translate-x-0 md:relative ${
        sidebarOpen 
          ? 'w-64 translate-x-0 border-r border-slate-200/80 dark:border-slate-900/80' 
          : 'w-0 -translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden'
      }`}>
        <div className="w-64 flex flex-col h-full flex-shrink-0">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 dark:border-slate-900/85">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
              <Sprout className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white leading-none">AgroChem POS</h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-1 inline-block">Admin Panel</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-655 dark:text-slate-400 dark:hover:text-slate-200 md:hidden focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 py-5 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <h4 className="px-4 text-[9px] font-bold text-slate-800 dark:text-slate-500 tracking-widest uppercase">
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
                          ? 'bg-emerald-600 dark:bg-emerald-600 text-white dark:text-white shadow-md shadow-emerald-600/15'
                          : 'text-slate-800 hover:bg-slate-100/70 hover:text-slate-850 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-350'}`} />
                        <span>{item.label}</span>
                      </div>
                      
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isActive 
                            ? 'bg-white text-emerald-700 dark:text-emerald-700' 
                            : item.label === 'Products' 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-250 dark:border-amber-500/20' 
                              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-500/20'
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
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-900 bg-slate-100/40 dark:bg-[#1a1a1a]/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/40 dark:hover:bg-[#2d2d2d]/60 transition-colors duration-150 text-left focus:outline-none group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700/80 border border-emerald-600/30 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                KA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-450 transition-colors">Kwame Asante</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate">Administrator</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-350 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-[#ffffff] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 shadow-sm transition-colors duration-200">
          {/* Left Panel Menu Trigger */}
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900">
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

            {/* Notifications selector */}
            <button
              title="Notifications"
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all active:scale-95 border border-slate-200 dark:border-slate-800 focus:outline-none relative"
            >
              <Bell className="w-4.5 h-4.5" />
              {lowStockCount + creditAccountCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Actual page layout */}
        <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900/40 focus:outline-none p-6 text-slate-800 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
