import { create } from 'zustand';

const MOCK_STAFF = [
  { id: 'staff-1', name: 'Kwame Asante', phone: '0551234567', email: 'kwame@agrochem.com', role: 'admin', password: 'admin123', status: 'active' },
  { id: 'staff-2', name: 'Rita Asare', phone: '0547654321', email: 'rita@agrochem.com', role: 'sales', password: 'sales123', status: 'active' }
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

  // OTHER STATE
}));
