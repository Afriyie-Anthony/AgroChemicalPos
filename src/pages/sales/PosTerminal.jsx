import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';
import {
  Search,
  Trash2,
  UserPlus,
  CreditCard,
  Smartphone,
  Coins,
  DollarSign,
  AlertCircle,
  X,
  Check,
  Printer,
  ChevronDown
} from 'lucide-react';

export default function PosTerminal() {
  const {
    products,
    customers,
    cart,
    selectedCustomer,
    wholesaleMode,
    heldCarts,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    setSelectedCustomer,
    setWholesaleMode,
    holdCart,
    resumeCart,
    addCustomer,
    checkout,
    categories
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Checkout & Customer Modals State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLimit, setNewCustLimit] = useState(500);
  const [newCustSegment, setNewCustSegment] = useState('Smallholder Farmer');

  // Checkout Payment State
  const [payMethod, setPayMethod] = useState('cash'); // cash, momo, credit, card, split
  const [cashTendered, setCashTendered] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoNetwork, setMomoNetwork] = useState('MTN');
  const [momoReference, setMomoReference] = useState('');
  const [splitAmounts, setSplitAmounts] = useState({ cash: 0, momo: 0 });
  const [checkoutError, setCheckoutError] = useState('');

  const categoriesList = useMemo(() => ['All', ...categories], [categories]);

  // Smart search and category filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);

      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;

      return matchesSearch && matchesCategory && p.status === 'active';
    });
  }, [products, searchQuery, activeCategory]);

  // Cart Summary (Taxes removed)
  const cartSummary = useMemo(() => {
    const total = cart.reduce((sum, item) => sum + (item.price - item.discount) * item.quantity, 0);
    return {
      subtotal: total,
      totalTax: 0,
      total: total
    };
  }, [cart]);

  // Handle add item (picks the first expired batch = FEFO)
  const handleAddItem = (product) => {
    const availableBatches = [...product.batches]
      .filter(b => b.quantity > 0)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    if (availableBatches.length === 0) {
      alert('Product is out of stock in all batches.');
      return;
    }

    addToCart(product, availableBatches[0].id, 1);
  };

  // Create & attach new customer
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const added = addCustomer({
      name: newCustName,
      phone: newCustPhone,
      segment: newCustSegment,
      creditLimit: parseFloat(newCustLimit) || 500,
      location: 'Local Region',
      gpsAddress: 'N/A'
    });

    setSelectedCustomer(added);
    setShowCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  // Submit Sale Checkout
  const handleProcessCheckout = (e) => {
    e.preventDefault();
    setCheckoutError('');

    const total = cartSummary.total;
    let paymentDetails = {
      method: payMethod,
      amountPaid: total,
      details: {}
    };

    if (payMethod === 'cash') {
      const tendered = parseFloat(cashTendered);
      if (isNaN(tendered) || tendered < total) {
        setCheckoutError(`Cash tendered must be at least GHS ${total.toFixed(2)}`);
        return;
      }
      paymentDetails.amountPaid = tendered;
    } else if (payMethod === 'momo') {
      if (!momoNumber || momoNumber.length < 9) {
        setCheckoutError('Please enter a valid Mobile Money number');
        return;
      }
      paymentDetails.details = {
        network: momoNetwork,
        reference: momoReference || `MOMO-${Date.now().toString().slice(-6)}`,
        momoNumber
      };
    } else if (payMethod === 'split') {
      const cashVal = parseFloat(splitAmounts.cash) || 0;
      const momoVal = parseFloat(splitAmounts.momo) || 0;
      if (Number((cashVal + momoVal).toFixed(2)) !== Number(total.toFixed(2))) {
        setCheckoutError(`Combined split amounts (GHS ${(cashVal + momoVal).toFixed(2)}) must equal cart total (GHS ${total.toFixed(2)})`);
        return;
      }
      paymentDetails.splitAmounts = { cash: cashVal, momo: momoVal };
      paymentDetails.amountPaid = total;
    } else if (payMethod === 'credit') {
      if (!selectedCustomer) {
        setCheckoutError('A customer must be attached for credit checkouts');
        return;
      }
      const availableCredit = selectedCustomer.creditLimit - selectedCustomer.outstandingCredit;
      if (total > availableCredit) {
        setCheckoutError(`Credit limit exceeded. Available credit: GHS ${availableCredit.toFixed(2)}`);
        return;
      }
    }

    const res = checkout(paymentDetails);
    if (res.success) {
      setCompletedTransaction(res.transaction);
      setShowCheckoutModal(false);
      setShowReceiptModal(true);
      setCashTendered('');
      setMomoNumber('');
      setMomoReference('');
      setSplitAmounts({ cash: 0, momo: 0 });
    } else {
      setCheckoutError(res.message || 'Checkout failed');
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-5 -m-6 max-h-[calc(100vh-70px)] overflow-hidden text-slate-800 dark:text-slate-100">
      
      {/* Left Area - POS Terminal Search & Catalog */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto max-h-[calc(100vh-70px)]">
        {/* Search & Mode Toggles */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, brand, active ingredient or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
          <div className="flex space-x-2 bg-white dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start shadow-sm">
            <button
              onClick={() => setWholesaleMode(false)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                !wholesaleMode
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Retail Mode
            </button>
            <button
              onClick={() => setWholesaleMode(true)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                wholesaleMode
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Wholesale Mode
            </button>
          </div>
        </div>

        {/* Category Browsing Tabs */}
        <div className="flex space-x-1.5 overflow-x-auto pb-3 mb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-slate-800 dark:bg-slate-100 text-slate-100 dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-950/30 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <span className="text-3xl mb-2">🌿</span>
              <p className="text-xs">No active products match your filter search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(p => {
                const totalStock = p.batches.reduce((sum, b) => sum + b.quantity, 0);
                const showPrice = wholesaleMode ? p.wholesalePrice : p.retailPrice;
                const isOutOfStock = totalStock <= 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => handleAddItem(p)}
                    className={`bg-white dark:bg-slate-950/50 border rounded-2xl p-4 text-left flex flex-col justify-between h-40 transition-all hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-950/80 active:scale-98 group shadow-sm ${
                      isOutOfStock ? 'opacity-40 border-slate-200 dark:border-slate-900 cursor-not-allowed' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                          {p.category}
                        </span>
                        <span className={`text-[10px] font-bold ${totalStock <= p.reorderLevel ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {totalStock > 0 ? `${totalStock} units` : 'Out of Stock'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">Brand: {p.brand}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-900/60 pt-2.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {formatCurrency(showPrice)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                        Add to Cart
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Area - Cart Panel & Checkout Action */}
      <div className="w-full lg:w-96 bg-white dark:bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100vh-70px)] overflow-hidden shadow-lg">
        {/* Cart Header & Customer Indicator */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Shopping Cart</h3>
            <button
              onClick={clearCart}
              className="text-[10px] text-red-500 dark:text-red-400 hover:bg-red-500/5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              Clear Cart
            </button>
          </div>

          {/* Customer Attach Area */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between shadow-inner">
            {selectedCustomer ? (
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{selectedCustomer.name}</p>
                  <button onClick={() => setSelectedCustomer(null)} className="text-[9px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold">✕ REMOVE</button>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Phone: {selectedCustomer.phone}</p>
                <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 mt-1.5 border-t border-slate-200 dark:border-slate-800 pt-1">
                  <span>Available Credit:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    GHS {(selectedCustomer.creditLimit - selectedCustomer.outstandingCredit).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between space-x-2">
                <select
                  onChange={(e) => {
                    const found = customers.find(c => c.id === e.target.value);
                    if (found) setSelectedCustomer(found);
                  }}
                  className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 focus:outline-none"
                  value=""
                >
                  <option value="" disabled>Attach Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600 text-xs">
              <span>Cart is currently empty</span>
              <p className="text-[10px] text-slate-400 dark:text-slate-700 mt-1">Add items from catalog</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.productId}-${item.batchId}`} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2 text-xs shadow-sm">
                <div className="flex justify-between">
                  <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</p>
                  <button
                    onClick={() => removeFromCart(item.productId, item.batchId)}
                    className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                  <span>Batch: <span className="text-emerald-600 dark:text-emerald-400 font-mono">{item.batchNumber}</span></span>
                  <span>Price: {formatCurrency(item.price)}</span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-950">
                  <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQty(item.productId, item.batchId, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center text-xs text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateCartQty(item.productId, item.batchId, parseFloat(e.target.value) || 0)}
                      className="w-8 text-center text-[10px] bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none border-none"
                    />
                    <button
                      onClick={() => updateCartQty(item.productId, item.batchId, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center text-xs text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency((item.price - item.discount) * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Held Carts Info Drawer */}
        {heldCarts.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest block mb-1">Held Sessions ({heldCarts.length})</span>
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {heldCarts.map((hc, idx) => (
                <button
                  key={idx}
                  onClick={() => resumeCart(idx)}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-semibold rounded text-slate-600 dark:text-slate-300 hover:border-emerald-500 whitespace-nowrap shadow-sm"
                >
                  Resume: {hc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cart Totals & Checkout Trigger */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-xs space-y-2">
          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100 text-sm pt-1">
            <span>Amount Owed</span>
            <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(cartSummary.total)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => {
                if (cart.length === 0) return;
                holdCart();
              }}
              className="py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold uppercase transition-all active:scale-95 shadow-sm"
            >
              Hold Session
            </button>
            <button
              onClick={() => {
                if (cart.length === 0) return;
                setShowCheckoutModal(true);
              }}
              disabled={cart.length === 0}
              className={`py-2.5 font-bold uppercase rounded-xl text-[10px] shadow-sm transition-all active:scale-95 ${
                cart.length === 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-800'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
              }`}
            >
              Checkout (GHS)
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add Customer */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Register New Customer</h2>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-slate-655 dark:text-slate-500 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Osei"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0244123456"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Customer Segment</label>
                <select
                  value={newCustSegment}
                  onChange={(e) => setNewCustSegment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Smallholder Farmer">Smallholder Farmer</option>
                  <option value="Commercial Farmer">Commercial Farmer</option>
                  <option value="Agro-Dealer">Agro-Dealer Wholesale</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Credit Limit (GHS)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={newCustLimit}
                  onChange={(e) => setNewCustLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl text-xs"
                >
                  Attach & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Checkout */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Finalize Sales Payment</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Amount due: {formatCurrency(cartSummary.total)}</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-655 dark:text-slate-500 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleProcessCheckout} className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
              {/* Payment Method Selector Grid */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setPayMethod('cash'); setCheckoutError(''); }}
                  className={`py-2 text-[10px] font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    payMethod === 'cash'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Coins className="w-4.5 h-4.5" />
                  <span>Cash Payment</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPayMethod('momo'); setCheckoutError(''); }}
                  className={`py-2 text-[10px] font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    payMethod === 'momo'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-4.5 h-4.5" />
                  <span>MoMo Payment</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPayMethod('credit'); setCheckoutError(''); }}
                  className={`py-2 text-[10px] font-bold rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    payMethod === 'credit'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4.5 h-4.5" />
                  <span>Store Credit</span>
                </button>
              </div>

              {/* Conditional Payment fields */}
              {payMethod === 'cash' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Cash Tendered (GHS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  {cashTendered && parseFloat(cashTendered) >= cartSummary.total && (
                    <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex justify-between bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span>Change to Return:</span>
                      <span>{formatCurrency(parseFloat(cashTendered) - cartSummary.total)}</span>
                    </div>
                  )}
                </div>
              )}

              {payMethod === 'momo' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Momo Network</label>
                    <div className="flex space-x-2">
                      {['MTN', 'Telecel', 'AirtelTigo'].map(net => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setMomoNetwork(net)}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border text-center ${
                            momoNetwork === net
                              ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-950 border-transparent'
                              : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {net}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Customer Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0244123456"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Transaction Ref (Optional)</label>
                    <input
                      type="text"
                      placeholder="Automatic reference"
                      value={momoReference}
                      onChange={(e) => setMomoReference(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {payMethod === 'credit' && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Attached Debtor:</span>
                    <span>{selectedCustomer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Credit Limit:</span>
                    <span>GHS {selectedCustomer ? (selectedCustomer.creditLimit - selectedCustomer.outstandingCredit).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5 font-bold">
                    <span>New Balance Owed:</span>
                    <span className="text-red-550 dark:text-red-400 font-bold">
                      GHS {selectedCustomer ? (selectedCustomer.outstandingCredit + cartSummary.total).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              )}

              {checkoutError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-550 dark:text-red-450 font-bold flex items-center space-x-1.5 animate-pulse">
                  <AlertCircle className="w-4.5 h-4.5 text-red-500" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl text-xs shadow-sm"
                >
                  Confirm checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thermal Receipt Print Layout */}
      {showReceiptModal && completedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-955/80 backdrop-blur-sm">
          <div id="receipt-print-area" className="w-full max-w-sm bg-white text-slate-950 border border-slate-300 rounded-3xl overflow-hidden shadow-2xl p-6 font-mono text-[11px] animate-in fade-in zoom-in-95 duration-150">
            {/* Thermal Slip header */}
            <div className="text-center space-y-1">
              <span className="text-lg">🌿</span>
              <h2 className="text-sm font-bold uppercase">AgroChem POS Store</h2>
              <p>Nsawam Main Road, Eastern Region</p>
              <p>GPS: EN-023-4567 | Phone: 0244123456</p>
              <p className="border-b border-dashed border-slate-400 pb-2">GRA TIN: GHA-98765432-1</p>
            </div>

            {/* Receipt metadata */}
            <div className="py-2.5 space-y-1 text-slate-900">
              <div className="flex justify-between">
                <span>Trx Code:</span>
                <span className="font-bold">{completedTransaction.transactionCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(completedTransaction.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{completedTransaction.cashierName}</span>
              </div>
              {completedTransaction.customer && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{completedTransaction.customer.name}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-dashed border-slate-400 pb-2">
                <span>Pay Mode:</span>
                <span className="font-bold uppercase">{completedTransaction.paymentMethod}</span>
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-2 text-slate-900">
              <div className="flex font-bold">
                <span className="flex-1">Item Description</span>
                <span className="w-10 text-center">Qty</span>
                <span className="w-20 text-right">Price</span>
              </div>
              {completedTransaction.items.map((it, idx) => (
                <div key={idx} className="flex">
                  <div className="flex-1">
                    <span>{it.name}</span>
                    <span className="block text-[9px] text-slate-500">Batch: {it.batchNumber}</span>
                  </div>
                  <span className="w-10 text-center">{it.quantity}</span>
                  <span className="w-20 text-right">{formatCurrency((it.price - it.discount) * it.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-slate-900 font-medium">
              <div className="flex justify-between text-xs font-bold pt-1">
                <span>Total Paid:</span>
                <span>{formatCurrency(completedTransaction.total)}</span>
              </div>
            </div>

            {/* Footer advice */}
            <div className="text-center pt-3 space-y-1.5">
              <p className="font-bold uppercase text-red-600 flex items-center justify-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Safety Warning</span>
              </p>
              <p className="text-[9px] text-slate-600 font-sans leading-relaxed">
                Ensure all chemicals are locked away from kids. Always wash hands after usage. Report any adverse reactions to MoFA/EPA.
              </p>
              <p className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 font-bold">Thank you for your business!</p>

              <div className="flex space-x-2 mt-4 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold py-2.5 rounded-xl text-xs flex justify-center items-center space-x-1.5 shadow-md shadow-emerald-500/10 focus:outline-none"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setCompletedTransaction(null);
                  }}
                  className="flex-1 bg-slate-900 text-white hover:bg-slate-800 font-bold py-2.5 rounded-xl text-xs flex justify-center items-center space-x-1.5 shadow-md focus:outline-none"
                >
                  <span>Next Sale</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
