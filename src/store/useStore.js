import { create } from 'zustand';

const MOCK_STAFF = [
  { id: 'staff-1', name: 'Kwame Asante', phone: '0551234567', email: 'kwame@agrochem.com', role: 'admin', password: 'admin123', status: 'active' },
  { id: 'staff-2', name: 'Rita Asare', phone: '0547654321', email: 'rita@agrochem.com', role: 'sales', password: 'sales123', status: 'active' }
];

const INITIAL_TRX = [
  {
    id: 'trx-1',
    transactionCode: 'TRX-59124-GH',
    items: [
      { productId: 'prod-1', name: 'Glyphosate 480 SL (Weedone)', category: 'Herbicides', unit: 'Litre', price: 65.00, quantity: 2, discount: 0, taxExempt: false, batchNumber: 'GLY-B024', batchId: 'b1-1' }
    ],
    customer: { id: 'cust-1', name: 'Kofi Mensah' },
    cashierId: 'staff-2',
    cashierName: 'Rita Asare',
    subtotal: 130.00,
    tax: 0.00,
    total: 130.00,
    paymentMethod: 'cash',
    amountPaid: 150.00,
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
  },
  {
    id: 'trx-2',
    transactionCode: 'TRX-74891-GH',
    items: [
      { productId: 'prod-2', name: 'NPK 15-15-15 Fertilizer', category: 'Fertilizers', unit: '50kg Bag', price: 450.00, quantity: 1, discount: 0, taxExempt: false, batchNumber: 'NPK-Y-2025', batchId: 'b2-1' }
    ],
    customer: null,
    cashierId: 'staff-2',
    cashierName: 'Rita Asare',
    subtotal: 450.00,
    tax: 0.00,
    total: 450.00,
    paymentMethod: 'momo',
    momoNetwork: 'MTN',
    paymentReference: '109283746',
    amountPaid: 450.00,
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  }
];

export const useStore = create((set, get) => ({
  // AUTHENTICATION STATE
  currentUser: null,
  isAuthenticated: false,
  staffList: MOCK_STAFF,
  theme: 'light', // 'light' or 'dark'

  // CUSTOM ALERT STATE
  alertConfig: { isOpen: false, message: '', type: 'info', title: '', onConfirm: null },
  showAlert: (message, type = 'info', title = 'Notice', onConfirm = null) => set({ alertConfig: { isOpen: true, message, type, title, onConfirm } }),
  closeAlert: () => set(state => ({ alertConfig: { ...state.alertConfig, isOpen: false } })),

  toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  login: (email, password) => {
    const staff = get().staffList.find(
      s => s.email.toLowerCase() === email.toLowerCase() && s.password === password && s.status === 'active'
    );
    if (staff) {
      set({ currentUser: staff, isAuthenticated: true });
      return { success: true, user: staff };
    }
    return { success: false, message: 'Invalid email or password' };
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  // API-driven auth helpers
  setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: true }),
  clearCurrentUser: () => set({ currentUser: null, isAuthenticated: false }),



  expenseCategories: ['Utilities', 'Transport & Logistics', 'Rent', 'Maintenance & Repairs', 'Staff Welfare', 'Marketing & Advertising', 'Office Supplies', 'Insurance', 'Taxes & Levies', 'Miscellaneous'],
  // STAFF MANAGEMENT
  addStaff: (staff) => {
    const newStaff = {
      ...staff,
      id: `staff-${Date.now()}`,
      status: 'active'
    };
    set(state => ({ staffList: [...state.staffList, newStaff] }));
    return newStaff;
  },

  updateStaff: (id, updatedFields) => {
    set(state => {
      const updatedList = state.staffList.map(s => s.id === id ? { ...s, ...updatedFields } : s);
      const isSelf = state.currentUser?.id === id;
      return {
        staffList: updatedList,
        currentUser: isSelf ? { ...state.currentUser, ...updatedFields } : state.currentUser
      };
    });
  },

  // POS / CART STATE
  cart: [],
  selectedCustomer: null,
  wholesaleMode: false,
  heldCarts: [],

  setWholesaleMode: (mode) => set({ wholesaleMode: mode }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  addToCart: (product, batchId, qty = 1) => {
    // FEFO split-lot allocation strategy
    // Get all available batches sorted by expiry date
    const sortedBatches = [...product.batches]
      .filter(b => b.quantity > 0)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    if (sortedBatches.length === 0) return;

    set(state => {
      let remainingQty = qty;
      let updatedCart = [...state.cart];

      for (const batch of sortedBatches) {
        if (remainingQty <= 0) break;

        const existingItem = updatedCart.find(item => item.productId === product.id && item.batchId === batch.id);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const availableInBatch = batch.quantity - currentQtyInCart;

        if (availableInBatch <= 0) continue;

        const allocatedFromBatch = Math.min(remainingQty, availableInBatch);
        remainingQty -= allocatedFromBatch;

        if (existingItem) {
          updatedCart = updatedCart.map(item =>
            (item.productId === product.id && item.batchId === batch.id)
              ? { ...item, quantity: item.quantity + allocatedFromBatch }
              : item
          );
        } else {
          const itemPrice = state.wholesaleMode ? product.wholesalePrice : product.retailPrice;
          updatedCart.push({
            productId: product.id,
            name: product.name,
            category: product.category,
            unit: product.unit,
            batchId: batch.id,
            batchNumber: batch.batchNumber,
            expiryDate: batch.expiryDate,
            price: itemPrice,
            quantity: allocatedFromBatch,
            discount: 0,
            taxExempt: product.category === 'Farm Tools & Equipment'
          });
        }
      }

      // If we cannot allocate the full requested quantity across all batches, reject the operation
      if (remainingQty > 0) {
        return {};
      }

      return { cart: updatedCart };
    });
  },

  removeFromCart: (productId, batchId) => {
    set(state => ({
      cart: state.cart.filter(item => !(item.productId === productId && item.batchId === batchId))
    }));
  },

  updateCartQty: (productId, batchId, quantity) => {
    const product = get().products.find(p => p.id === productId);
    const batch = product?.batches.find(b => b.id === batchId);
    if (!batch) return;

    set(state => ({
      cart: state.cart.map(item => {
        if (item.productId === productId && item.batchId === batchId) {
          const clampedQty = Math.max(0.01, Math.min(quantity, batch.quantity));
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    }));
  },

  clearCart: () => set({ cart: [], selectedCustomer: null }),

  holdCart: (holdName = `Cart ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`) => {
    const currentCart = get().cart;
    const currentCustomer = get().selectedCustomer;
    if (currentCart.length === 0) return false;

    set(state => ({
      heldCarts: [...state.heldCarts, { name: holdName, cart: currentCart, customer: currentCustomer, time: new Date().toISOString() }],
      cart: [],
      selectedCustomer: null
    }));
    return true;
  },

  resumeCart: (index) => {
    const held = get().heldCarts[index];
    if (!held) return;
    set(state => ({
      cart: held.cart,
      selectedCustomer: held.customer,
      heldCarts: state.heldCarts.filter((_, i) => i !== index)
    }));
  },

  // TRANSACTION LOGS
  transactions: INITIAL_TRX,

  voidTransaction: (trxId, voidReason) => {
    const transaction = get().transactions.find(t => t.id === trxId);
    if (!transaction || transaction.status === 'voided') return { success: false, message: 'Transaction not found or already voided' };

    // Return items to inventory batches
    transaction.items.forEach(item => {
      get().adjustStock(item.productId, item.batchId, item.quantity, 'void');
    });

    // Reduce outstanding credit if credit sale
    if (transaction.paymentMethod === 'credit' && transaction.customer) {
      get().adjustCredit(transaction.customer.id, -transaction.total);
    }

    // Mark as voided in store
    set(state => ({
      transactions: state.transactions.map(t => 
        t.id === trxId 
          ? { ...t, status: 'voided', voidReason, voidedAt: new Date().toISOString() } 
          : t
      )
    }));

    return { success: true };
  },

  checkout: (paymentDetails) => {
    const cart = get().cart;
    const selectedCustomer = get().selectedCustomer;
    const currentUser = get().currentUser;

    if (cart.length === 0) return { success: false, message: 'Cart is empty' };

    let totalCost = 0;

    cart.forEach(item => {
      totalCost += (item.price - item.discount) * item.quantity;
    });

    const totalExcludingTax = totalCost;
    const totalTax = 0;

    if (paymentDetails.method === 'credit') {
      if (!selectedCustomer) return { success: false, message: 'A customer must be attached for credit sales' };
      const availableCredit = selectedCustomer.creditLimit - selectedCustomer.outstandingCredit;
      if (totalCost > availableCredit) {
        return { success: false, message: `Credit limit exceeded. Available credit: GHS ${availableCredit.toFixed(2)}` };
      }
    }

    cart.forEach(item => {
      get().adjustStock(item.productId, item.batchId, -item.quantity, 'sale');
    });

    if (paymentDetails.method === 'credit' && selectedCustomer) {
      get().adjustCredit(selectedCustomer.id, totalCost);
    }

    if (selectedCustomer) {
      const pointsEarned = Math.floor(totalCost / 5);
      get().addLoyaltyPoints(selectedCustomer.id, pointsEarned);
    }

    const transactionCode = `TRX-${Date.now().toString().slice(-6)}-GH`;
    const newTransaction = {
      id: `trx-${Date.now()}`,
      transactionCode,
      items: cart,
      customer: selectedCustomer,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      subtotal: Number(totalExcludingTax.toFixed(2)),
      tax: Number(totalTax.toFixed(2)),
      total: Number(totalCost.toFixed(2)),
      paymentMethod: paymentDetails.method,
      paymentReference: paymentDetails.details?.reference || '',
      momoNetwork: paymentDetails.details?.network || '',
      amountPaid: paymentDetails.amountPaid || totalCost,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    set(state => {
      return {
        transactions: [newTransaction, ...state.transactions],
        cart: [],
        selectedCustomer: null
      };
    });

    return { success: true, transaction: newTransaction };
  }
}));
