import { create } from 'zustand';

// Mock Initial Data for Ghana Agro-Chemical Context
const INITIAL_EXPENSES = [
  { id: 'exp-1', description: 'Electricity bill - June 2026', category: 'Utilities', amount: 320.00, date: '2026-06-01', paidBy: 'Kwame Asante', paymentMethod: 'bank_transfer', reference: 'ECG-JUN-2026', notes: 'Monthly electricity bill for warehouse and shop' },
  { id: 'exp-2', description: 'Fuel for delivery truck', category: 'Transport & Logistics', amount: 450.00, date: '2026-06-05', paidBy: 'Kwame Asante', paymentMethod: 'cash', reference: '', notes: 'Fuel for Sunyani and Kumasi deliveries' },
  { id: 'exp-3', description: 'Shop rent - June', category: 'Rent', amount: 2500.00, date: '2026-06-01', paidBy: 'Kwame Asante', paymentMethod: 'bank_transfer', reference: 'RENT-JUN-2026', notes: 'Monthly shop rent at Nsawam main road' },
  { id: 'exp-4', description: 'Knapsack sprayer repair parts', category: 'Maintenance & Repairs', amount: 85.00, date: '2026-06-10', paidBy: 'Rita Asare', paymentMethod: 'momo', reference: 'MTN-8829371', notes: 'Spare nozzles and hoses' },
  { id: 'exp-5', description: 'Staff lunch allowance', category: 'Staff Welfare', amount: 120.00, date: '2026-06-12', paidBy: 'Kwame Asante', paymentMethod: 'cash', reference: '', notes: 'Weekly lunch allowance for 3 staff' },
];


const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Kofi Mensah',
    phone: '0244123456',
    email: 'kofi.mensah@gmail.com',
    location: 'Nsawam, Eastern Region',
    gpsAddress: 'EN-023-4567',
    segment: 'Smallholder Farmer',
    creditLimit: 500.00,
    outstandingCredit: 150.00,
    loyaltyPoints: 120,
    createdAt: '2025-01-15'
  },
  {
    id: 'cust-2',
    name: 'Amma Serwaa (Serwaa Farms)',
    phone: '0207654321',
    email: 'serwaafarms@yahoo.com',
    location: 'Sunyani, Bono Region',
    gpsAddress: 'BS-098-7654',
    segment: 'Commercial Farmer',
    creditLimit: 5000.00,
    outstandingCredit: 1200.00,
    loyaltyPoints: 850,
    createdAt: '2025-02-10'
  },
  {
    id: 'cust-3',
    name: 'Yaw Boateng Agro-Chemicals',
    phone: '0277987654',
    email: 'yboatenghere@gmail.com',
    location: 'Kumasi, Ashanti Region',
    gpsAddress: 'AK-112-2233',
    segment: 'Agro-Dealer',
    creditLimit: 10000.00,
    outstandingCredit: 0.00,
    loyaltyPoints: 1500,
    createdAt: '2025-03-01'
  }
];

const INITIAL_SUPPLIERS = [
  { id: 'sup-1', name: 'Yara Ghana Limited', contactPerson: 'Daniel Alabi', phone: '0302123456', email: 'sales.ghana@yara.com', location: 'Tema, Greater Accra' },
  { id: 'sup-2', name: 'Bayer West Africa', contactPerson: 'Evelyn Addo', phone: '0302765432', email: 'evelyn.addo@bayer.com', location: 'Accra, Greater Accra' },
  { id: 'sup-3', name: 'RMG Ghana Ltd', contactPerson: 'Frank Osei', phone: '0302998877', email: 'f.osei@rmgghana.com', location: 'Tema Industrial Area' }
];

const INITIAL_PO = [
  {
    id: 'po-1',
    poCode: 'LPO-2026-001',
    supplierId: 'sup-1',
    supplierName: 'Yara Ghana Limited',
    status: 'ordered',
    items: [
      { productId: 'prod-2', name: 'NPK 15-15-15 Fertilizer', quantity: 20, unitPrice: 380.00 }
    ],
    createdAt: '2026-06-10T14:00:00Z'
  },
  {
    id: 'po-2',
    poCode: 'LPO-2026-002',
    supplierId: 'sup-2',
    supplierName: 'Bayer West Africa',
    status: 'received',
    items: [
      { productId: 'prod-3', name: 'Confidor 200 SL', quantity: 15, unitPrice: 28.00 }
    ],
    createdAt: '2026-06-05T09:30:00Z'
  }
];

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

  // INVENTORY STATE
  products: [], // Kept temporarily so components don't crash while refactoring
  suppliers: INITIAL_SUPPLIERS,
  purchaseOrders: INITIAL_PO,
  adjustments: [],

  expenses: INITIAL_EXPENSES,
  expenseCategories: ['Utilities', 'Transport & Logistics', 'Rent', 'Maintenance & Repairs', 'Staff Welfare', 'Marketing & Advertising', 'Office Supplies', 'Insurance', 'Taxes & Levies', 'Miscellaneous'],



  // SUPPLIER MANAGEMENT ACTIONS
  addSupplier: (supplier) => {
    const newSupplier = {
      ...supplier,
      id: `sup-${Date.now()}`
    };
    set(state => ({ suppliers: [...state.suppliers, newSupplier] }));
    return newSupplier;
  },

  updateSupplier: (id, updatedFields) => {
    set(state => ({
      suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...updatedFields } : s)
    }));
  },

  deleteSupplier: (id) => {
    set(state => ({
      suppliers: state.suppliers.filter(s => s.id !== id)
    }));
  },

  // EXPENSE MANAGEMENT ACTIONS
  addExpense: (expense) => {
    const newExpense = {
      ...expense,
      id: `exp-${Date.now()}`
    };
    set(state => ({ expenses: [newExpense, ...state.expenses] }));
    return newExpense;
  },

  updateExpense: (id, updatedFields) => {
    set(state => ({
      expenses: state.expenses.map(e => e.id === id ? { ...e, ...updatedFields } : e)
    }));
  },

  deleteExpense: (id) => {
    set(state => ({
      expenses: state.expenses.filter(e => e.id !== id)
    }));
  },

  // LPO & GRN PROCUREMENT ACTIONS
  createPurchaseOrder: (poData) => {
    const newPO = {
      ...poData,
      id: `po-${Date.now()}`,
      poCode: `LPO-2026-${String(get().purchaseOrders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    set(state => ({ purchaseOrders: [...state.purchaseOrders, newPO] }));
    return newPO;
  },

  receivePurchaseOrder: (poId, itemsToReceive) => {
    // itemsToReceive is an array of objects: { productId, batchNumber, expiryDate, quantity, unitPrice }
    const po = get().purchaseOrders.find(p => p.id === poId);
    if (!po) return { success: false, message: 'Purchase Order not found' };

    // Update PO status
    set(state => ({
      purchaseOrders: state.purchaseOrders.map(p => p.id === poId ? { ...p, status: 'received' } : p)
    }));

    // Update Products batches
    itemsToReceive.forEach(item => {
      set(state => ({
        products: state.products.map(p => {
          if (p.id !== item.productId) return p;

          // Check if batch number already exists for this product
          const batchIndex = p.batches.findIndex(b => b.batchNumber === item.batchNumber);
          let newBatches = [...p.batches];

          if (batchIndex > -1) {
            newBatches[batchIndex] = {
              ...newBatches[batchIndex],
              quantity: newBatches[batchIndex].quantity + item.quantity
            };
          } else {
            newBatches.push({
              id: `batch-${Date.now()}-${Math.random()}`,
              batchNumber: item.batchNumber,
              quantity: item.quantity,
              expiryDate: item.expiryDate,
              receivedDate: new Date().toISOString().split('T')[0],
              purchasePrice: item.unitPrice
            });
          }

          return {
            ...p,
            batches: newBatches
          };
        })
      }));
    });

    return { success: true };
  },

  // CUSTOMER STATE
  customers: INITIAL_CUSTOMERS,

  addCustomer: (customer) => {
    const newCust = {
      ...customer,
      id: `cust-${Date.now()}`,
      outstandingCredit: 0.00,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    set(state => ({ customers: [...state.customers, newCust] }));
    return newCust;
  },

  adjustCredit: (customerId, amountChange) => {
    set(state => ({
      customers: state.customers.map(c => {
        if (c.id !== customerId) return c;
        const newCredit = Number((c.outstandingCredit + amountChange).toFixed(2));
        return { ...c, outstandingCredit: newCredit };
      })
    }));
  },

  recordCreditRepayment: (customerId, amount) => {
    const cust = get().customers.find(c => c.id === customerId);
    if (!cust) return { success: false, message: 'Customer not found' };

    get().adjustCredit(customerId, -amount);
    
    // Simulate recording repayment under payment collections
    return { success: true };
  },

  addLoyaltyPoints: (customerId, points) => {
    set(state => ({
      customers: state.customers.map(c => c.id === customerId ? { ...c, loyaltyPoints: c.loyaltyPoints + points } : c)
    }));
  },

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
