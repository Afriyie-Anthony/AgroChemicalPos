import React, { useState, useMemo } from 'react';
import { AlertTriangle, Boxes, Check, Clipboard, RefreshCw, Search } from 'lucide-react';
import { useProductList, useAdjustStock } from '../../hooks/useProduct';
import { useCategoryList } from '../../hooks/useCategory';
import { useStore } from '../../store/useStore';

export default function StockControl() {
  const { showAlert } = useStore();
  const { data: products = [], isLoading } = useProductList();
  const { mutate: adjustStockApi, isPending: isAdjusting } = useAdjustStock();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('count correction');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: categoriesData = [] } = useCategoryList();
  const categoriesList = useMemo(() => ['All', ...categoriesData.map(c => c.name)], [categoriesData]);

  // Worksheet counting audit state
  const [auditQuantities, setAuditQuantities] = useState({});

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => {
      const totalQty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
      return totalQty <= p.reorderLevel;
    });
  }, [products]);

  const activeBatches = useMemo(() => {
    const prod = products.find(p => String(p.id) === String(selectedProduct));
    return prod && prod.batches ? prod.batches : [];
  }, [selectedProduct, products]);

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !selectedBatch || !adjustQty) return;

    const qty = parseFloat(adjustQty);
    adjustStockApi({ 
      id: selectedProduct, 
      data: { batchId: selectedBatch, quantityChange: qty, reason: adjustReason } 
    }, {
      onSuccess: () => {
        setAdjustQty('');
        setSelectedProduct('');
        setSelectedBatch('');
      }
    });
  };

  const handleAuditChange = (prodId, batchId, value) => {
    setAuditQuantities(prev => ({
      ...prev,
      [`${prodId}-${batchId}`]: value
    }));
  };

  const handleApplyAuditAdjust = (product, batch) => {
    const key = `${product.id}-${batch.id}`;
    const counted = parseFloat(auditQuantities[key]);
    if (isNaN(counted) || counted < 0) {
      showAlert('Please enter a valid counted quantity', 'error', 'Invalid Input');
      return;
    }

    const variance = counted - batch.quantity;
    if (variance === 0) {
      showAlert('Count matches current stock, no adjustments needed.', 'info', 'No Variance');
      return;
    }

    adjustStockApi({
      id: product.id,
      data: { batchId: batch.id, quantityChange: variance, reason: 'count correction' }
    }, {
      onSuccess: () => {
        showAlert(`Applied correction: ${variance > 0 ? '+' : ''}${variance} units. Count matches physical record now.`, 'success', 'Audit Complete');
        // Clear audit input
        setAuditQuantities(prev => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        });
      }
    });
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Stock Control & Auditing</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify batch counts, resolve spillage/damages, and manage physical inventory take sheets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="lg:col-span-3 flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {/* Stock take sheet / audit tool */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-1.5">
              <Clipboard className="w-5 h-5 text-emerald-500" />
              <span>Physical Stock Count Audit Sheet</span>
            </h3>

            {/* Filters Area */}
            <div className="flex flex-col space-y-3 mb-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search products to audit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-xl whitespace-nowrap border transition-all ${
                      selectedCategory === cat
                        ? 'bg-slate-800 dark:bg-slate-100 text-slate-100 dark:text-slate-950 border-slate-800 dark:border-slate-100 shadow-md'
                        : 'bg-white dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredProducts.map(p => (
                <div key={p.id} className="py-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-850 dark:text-slate-200 text-xs">{p.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{p.category} | Brand: {p.brand}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded">
                      {p.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3">
                    {p.batches.map(b => {
                      const key = `${p.id}-${b.id}`;
                      const countedValue = auditQuantities[key] || '';
                      const variance = countedValue !== '' ? parseFloat(countedValue) - b.quantity : 0;

                      return (
                        <div key={b.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2.5">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-550 dark:text-slate-450">
                            <span>Batch: <span className="font-mono text-emerald-600 dark:text-emerald-400">{b.batchNumber}</span></span>
                            <span>System: <strong className="text-slate-700 dark:text-slate-300">{b.quantity}</strong></span>
                          </div>
                          
                          <div className="flex space-x-2 items-center">
                            <input
                              type="number"
                              placeholder="Counted Qty"
                              value={countedValue}
                              onChange={(e) => handleAuditChange(p.id, b.id, e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                            />
                            {countedValue !== '' && (
                                <button
                                  disabled={isAdjusting}
                                  onClick={() => handleApplyAuditAdjust(p, b)}
                                  className="px-2 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg hover:scale-105 transition-all focus:outline-none disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                            )}
                          </div>

                          {countedValue !== '' && (
                            <div className="flex justify-between text-[10px] font-bold bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-850">
                              <span className="text-slate-400">Variance:</span>
                              <span className={variance < 0 ? 'text-red-500' : variance > 0 ? 'text-emerald-600' : 'text-slate-500'}>
                                {variance > 0 ? '+' : ''}{variance.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adjustments Form & Reorder alerts sidebar */}
        <div className="space-y-6">
          {/* Quick Adjustment Form */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-1.5">
              <RefreshCw className="w-4.5 h-4.5 text-emerald-500" />
              <span>Quick Adjustment</span>
            </h3>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Select Product</label>
                <select
                  required
                  value={selectedProduct}
                  onChange={(e) => { setSelectedProduct(e.target.value); setSelectedBatch(''); }}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="" disabled>Choose product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {selectedProduct && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Select Batch</label>
                  <select
                    required
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="" disabled>Choose batch...</option>
                    {activeBatches.map(b => (
                      <option key={b.id} value={b.id}>{b.batchNumber} (Current stock: {b.quantity})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Adjust Quantity (+/-)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. -5 to reduce, 10 to add"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Adjustment Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="damage">Product Damage / Spillage</option>
                  <option value="theft">Stock Discrepancy / Write-off</option>
                  <option value="count correction">Physical Count Variance correction</option>
                  <option value="promotional give-away">Promotional Giveaway</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isAdjusting}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-98 disabled:opacity-60 flex justify-center items-center space-x-2"
              >
                {isAdjusting && <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>}
                <span>Apply Adjustment</span>
              </button>
            </form>
          </div>

          {/* Low Stock Watch */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              <span>Low Stock Watchlist ({lowStockProducts.length})</span>
            </h3>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                All stock values are healthy!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {lowStockProducts.map(p => {
                  const qty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
                  return (
                    <div key={p.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500">Threshold: {p.reorderLevel} units</span>
                      </div>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {qty} units left
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>
      )}
      </div>
    </div>
  );
}
