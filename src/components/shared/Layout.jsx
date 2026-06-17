import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useLogout } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useProductList } from '../../hooks/useProduct';
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
  LogOut,
  Bell,
  Tags,
  Wallet
} from 'lucide-react';

export default function Layout({ children }) {
  const { currentUser, theme, toggleTheme, customers } = useStore();
  const { data: products = [] } = useProductList();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const { data: bizData } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic Badge Calculations
  const lowStockCount = useMemo(() => {
    return products.filter(p => {
      const totalQty = p.batches.reduce((sum, b) => sum + Number(b.quantity), 0);
      return totalQty <= p.reorderLevel;
    }).length;
  }, [products]);

  const creditAccountCount = useMemo(() => {
    return customers.filter(c => c.outstandingCredit > 0).length;
  }, [customers]);

  // Sidebar Menu Categorized Configuration
  const menuSections = useMemo(() => {
    const isAdmin = currentUser?.role === 'admin';
    const sections = [
      {
        title: 'MAIN',
        items: [
          { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/sales/pos', label: 'Sales POS', icon: ShoppingCart },
          { path: '/admin/transactions', label: 'Transactions', icon: Receipt },
        ]
      },
      isAdmin && {
        title: 'INVENTORY',
        items: [
          { path: '/admin/products', label: 'Products', icon: PackagesIcon, badge: lowStockCount },
          { path: '/admin/stock', label: 'Stock Control', icon: Boxes },
          { path: '/admin/suppliers', label: 'Suppliers', icon: Truck },
          { path: '/admin/purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
          { path: '/admin/categories', label: 'Categories', icon: Tags },
        ]
      },
      {
        title: 'BUSINESS',
        items: [
          { path: '/admin/customers', label: 'Customers', icon: Users },
          { path: '/admin/credit', label: 'Credit Accounts', icon: CreditCard, badge: creditAccountCount },
          isAdmin && { path: '/admin/expenses', label: 'Expenses', icon: Wallet },
          isAdmin && { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
        ].filter(Boolean)
      },
      {
        title: 'ADMIN',
        items: [
          isAdmin && { path: '/admin/staff', label: 'Staff & Access', icon: UserCheck },
          { path: '/admin/settings', label: 'Settings', icon: Settings },
        ].filter(Boolean)
      }
    ].filter(Boolean);

    return sections;
  }, [currentUser, lowStockCount, creditAccountCount]);

  // Helper custom icon wrapper for Products category
  function PackagesIcon(props) {
    return <Package {...props} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      
      {/* Mobile Sidebar Backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and mobile sliding */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 transition-all duration-300 transform md:translate-x-0 md:relative ${
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
              <h1 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white leading-none">{bizData?.shopName || 'AgroChem POS'}</h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-1 inline-block">
                {currentUser?.role === 'admin' ? 'Admin Panel' : 'Sales Panel'}
              </span>
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
                        if (window.innerWidth < 768) {
                          setSidebarOpen(false);
                        }
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
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-900 bg-slate-100/40 dark:bg-[#1a1a1a]/40 space-y-2">
          {/* User info */}
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-emerald-700/80 border border-emerald-600/30 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {currentUser?.name || 'Guest User'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate">
                {currentUser?.role === 'admin' ? 'Administrator' : 'Sales Associate'}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200/70 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 transition-all duration-150 focus:outline-none group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[11px] font-bold tracking-wide">Sign Out</span>
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
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{bizData?.shopName || 'Nsawam Main Store'}</h2>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">{bizData?.gpsAddress || 'Eastern Region, Ghana'}</span>
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
