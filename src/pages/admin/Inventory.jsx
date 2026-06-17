import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useProductList, useCreateProduct, useAdjustStock } from '../../hooks/useProduct';
import { useCategoryList } from '../../hooks/useCategory';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, X, AlertTriangle, FileSpreadsheet, Package, Layers, Info } from 'lucide-react';

export default function Inventory() {
  const { data: products = [], isLoading } = useProductList();
  const { data: categoriesData = [] } = useCategoryList();
  const categories = categoriesData.map(c => c.name);

  const { mutate: createProductApi, isPending: isCreating } = useCreateProduct();
  const { mutate: adjustStockApi, isPending: isAdjusting } = useAdjustStock();
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals/Drawers toggle state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [activeProductForAdjust, setActiveProductForAdjust] = useState(null);
  const [activeBatchForAdjust, setActiveBatchForAdjust] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('count correction');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeProductForDetails, setActiveProductForDetails] = useState(null);

  // Add Product form states
  const [newProd, setNewProd] = useState({
    name: '',
    brand: '',
    category: categories[0] || 'Pesticides',
    unit: 'Litre',
    costPrice: '',
    retailPrice: '',
    wholesalePrice: '',
    reorderLevel: 5,
    barcode: '',
    batchNumber: '',
    batchQty: '',
    expiryDate: ''
  });

  const categoriesList = useMemo(() => ['All', ...categories], [categories]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.retailPrice || !newProd.batchNumber || !newProd.batchQty) {
      alert('Please fill in required fields: Name, Retail Price, Batch Number, and Batch Quantity.');
      return;
    }

    const productPayload = {
      name: newProd.name,
      brand: newProd.brand,
      category: newProd.category,
      unit: newProd.unit,
      costPrice: parseFloat(newProd.costPrice) || 0,
      retailPrice: parseFloat(newProd.retailPrice) || 0,
      wholesalePrice: parseFloat(newProd.wholesalePrice) || parseFloat(newProd.retailPrice) || 0,
      reorderLevel: parseInt(newProd.reorderLevel) || 5,
      barcode: newProd.barcode || Date.now().toString(),
      status: 'active',
      batches: [
        {
          batchNumber: newProd.batchNumber,
          quantity: parseFloat(newProd.batchQty) || 0,
          expiryDate: newProd.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
          receivedDate: new Date().toISOString().split('T')[0],
          purchasePrice: parseFloat(newProd.costPrice) || 0
        }
      ]
    };

    createProductApi(productPayload, {
      onSuccess: () => {
        setShowAddModal(false);
        
        // Reset Form
        setNewProd({
          name: '',
          brand: '',
          category: categories[0] || 'Pesticides',
          unit: 'Litre',
          costPrice: '',
          retailPrice: '',
          wholesalePrice: '',
          reorderLevel: 5,
          barcode: '',
          batchNumber: '',
          batchQty: '',
          expiryDate: ''
        });
      }
    });
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!activeProductForAdjust || !activeBatchForAdjust || !adjustQty) return;
    
    const qtyChange = parseFloat(adjustQty);
    
    adjustStockApi({ 
      id: activeProductForAdjust.id, 
      data: { batchId: activeBatchForAdjust, quantityChange: qtyChange, reason: adjustReason }
    }, {
      onSuccess: () => {
        setShowAdjustModal(false);
        setActiveProductForAdjust(null);
        setActiveBatchForAdjust('');
        setAdjustQty('');
      }
    });
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Product Catalogue & Inventory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage chemical formulations, batches, reorder values, and EPA registration numbers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap border transition-all ${
              selectedCategory === cat
                ? 'bg-slate-800 dark:bg-slate-100 text-slate-100 dark:text-slate-950 border-slate-800 dark:border-slate-100 shadow-md'
                : 'bg-white dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Inventory List */}
      <div className="premium-table-container">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category / Brand</th>
                <th className="px-6 py-4">Prices (Cost / Sell)</th>
                <th className="px-6 py-4">Total Stock</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                      <p className="mt-4 text-slate-500 font-medium">Loading Inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.map((p) => {
                const totalStock = p.batches.reduce((sum, b) => sum + b.quantity, 0);
                const isLowStock = totalStock <= p.reorderLevel;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors text-xs">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{p.category}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{p.brand}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Retail: {formatCurrency(p.retailPrice)}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Cost: {formatCurrency(p.costPrice)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${isLowStock ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
                          {totalStock} {p.unit}s
                        </span>
                        {isLowStock && (
                          <span className="flex items-center space-x-1 text-[9px] text-amber-600 dark:text-amber-500 mt-1.5 font-bold">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>Low Stock (Level: {p.reorderLevel})</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setActiveProductForDetails(p);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveProductForAdjust(p);
                            setActiveBatchForAdjust(p.batches[0]?.id || '');
                            setShowAdjustModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Add New Agro-Chemical Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Details */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paraquat 200 SL"
                    value={newProd.name}
                    onChange={(e) => setNewProd({...newProd, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. RMG"
                    value={newProd.brand}
                    onChange={(e) => setNewProd({...newProd, brand: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({...newProd, category: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    placeholder="e.g. Litre, 50kg Bag, Piece"
                    value={newProd.unit}
                    onChange={(e) => setNewProd({...newProd, unit: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Pricing Setup</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Cost Price (GHS)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProd.costPrice}
                      onChange={(e) => setNewProd({...newProd, costPrice: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Retail Price (GHS) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={newProd.retailPrice}
                      onChange={(e) => setNewProd({...newProd, retailPrice: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Wholesale Price (GHS)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProd.wholesalePrice}
                      onChange={(e) => setNewProd({...newProd, wholesalePrice: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Batch Section */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Initial Batch Setup</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Batch Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BAT-2025-01"
                      value={newProd.batchNumber}
                      onChange={(e) => setNewProd({...newProd, batchNumber: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Batch Qty *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50"
                      value={newProd.batchQty}
                      onChange={(e) => setNewProd({...newProd, batchQty: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={newProd.expiryDate}
                      onChange={(e) => setNewProd({...newProd, expiryDate: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl text-xs shadow-sm flex items-center space-x-2 disabled:opacity-60"
                >
                  {isCreating && <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock */}
      {showAdjustModal && activeProductForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Stock Adjustment</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{activeProductForAdjust.name}</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Select Batch</label>
                <select
                  value={activeBatchForAdjust}
                  onChange={(e) => setActiveBatchForAdjust(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {activeProductForAdjust.batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.batchNumber} (Current stock: {b.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Quantity Adjustment (+/-)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. -5 to reduce, 10 to increase"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Adjustment Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="damage">Product Damage / Spillage</option>
                  <option value="theft">Stock Discrepancy / Missing</option>
                  <option value="count correction">Physical Stock Count Audit</option>
                  <option value="promotional give-away">Promotional Giveaway</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-650 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl text-xs shadow-sm flex items-center space-x-2 disabled:opacity-60"
                >
                  {isAdjusting && <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>}
                  <span>Apply Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: View Product Details */}
      {showDetailsModal && activeProductForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Product Information</span>
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Full details and FEFO stock batches for {activeProductForDetails.name}</p>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Product Info Block */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product Name</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">{activeProductForDetails.name}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">{activeProductForDetails.category}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Brand Name</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-400 mt-1 block">{activeProductForDetails.brand || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Barcode</span>
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-1 block">{activeProductForDetails.barcode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unit of Measure</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 block">{activeProductForDetails.unit}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reorder Level</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-500 mt-1 block">{activeProductForDetails.reorderLevel} units</span>
                  </div>
                </div>
              </div>

              {/* Pricing Cards */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Pricing Setup</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 text-center">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Cost Price</span>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{formatCurrency(activeProductForDetails.costPrice)}</span>
                  </div>
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/15 rounded-2xl p-4 text-center">
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Retail Price</span>
                    <span className="block text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrency(activeProductForDetails.retailPrice)}</span>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 text-center">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Wholesale Price</span>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{formatCurrency(activeProductForDetails.wholesalePrice)}</span>
                  </div>
                </div>
              </div>

              {/* Batches Sub-table */}
              <div>
                <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  <Layers className="w-3.5 h-3.5" />
                  <span>FEFO Batches & Expiry Log ({activeProductForDetails.batches.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeProductForDetails.batches.map((b) => {
                    const today = new Date();
                    const diffDays = Math.ceil((new Date(b.expiryDate) - today) / (1000 * 60 * 60 * 24));
                    const isExpired = diffDays <= 0;
                    const isNearExpiry = diffDays > 0 && diffDays <= 180;

                    return (
                      <div key={b.id} className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between text-[11px] relative overflow-hidden shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">No: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{b.batchNumber}</span></span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{b.quantity} remaining</span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-slate-400 dark:text-slate-500">Expiry: {formatDate(b.expiryDate)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isExpired ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                            isNearExpiry ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
                          }`}>
                            {isExpired ? 'EXPIRED' : isNearExpiry ? `${diffDays} days left` : 'Good'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
