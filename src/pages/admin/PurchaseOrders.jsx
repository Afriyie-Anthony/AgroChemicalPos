import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ClipboardList, Plus, Truck, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function PurchaseOrders() {
  const { purchaseOrders, suppliers, products, createPurchaseOrder, receivePurchaseOrder } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  
  // Create PO forms state
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poItems, setPoItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }]);

  // Receive PO forms state
  const [activePOToReceive, setActivePOToReceive] = useState(null);
  const [receivedBatches, setReceivedBatches] = useState({}); // mapping line index -> { batchNumber, expiryDate, quantity, unitPrice }

  const activeSupplierName = useMemo(() => {
    const found = suppliers.find(s => s.id === selectedSupplierId);
    return found ? found.name : '';
  }, [selectedSupplierId, suppliers]);

  const handleAddLineItem = () => {
    setPoItems([...poItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (idx) => {
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx, field, value) => {
    const updated = [...poItems];
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      updated[idx] = {
        ...updated[idx],
        productId: value,
        name: prod ? prod.name : '',
        unitPrice: prod ? prod.costPrice : 0
      };
    } else if (field === 'quantity') {
      updated[idx].quantity = parseFloat(value) || 0;
    } else if (field === 'unitPrice') {
      updated[idx].unitPrice = parseFloat(value) || 0;
    }
    setPoItems(updated);
  };

  const handleCreatePOSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplierId || poItems.some(it => !it.productId)) {
      alert('Please select a supplier and add at least one valid product.');
      return;
    }

    createPurchaseOrder({
      supplierId: selectedSupplierId,
      supplierName: activeSupplierName,
      status: 'ordered',
      items: poItems
    });

    setShowCreateModal(false);
    setSelectedSupplierId('');
    setPoItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const openReceiveModal = (po) => {
    setActivePOToReceive(po);
    const initialBatches = {};
    po.items.forEach((it, index) => {
      initialBatches[index] = {
        productId: it.productId,
        name: it.name,
        batchNumber: `BAT-${Date.now().toString().slice(-4)}`,
        expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], // Default 1 year out
        quantity: it.quantity,
        unitPrice: it.unitPrice
      };
    });
    setReceivedBatches(initialBatches);
    setShowReceiveModal(true);
  };

  const handleReceiveChange = (idx, field, value) => {
    setReceivedBatches(prev => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value
      }
    }));
  };

  const handleReceiveSubmit = (e) => {
    e.preventDefault();
    if (!activePOToReceive) return;

    // Convert mapping object to array of received items
    const receivedArray = Object.keys(receivedBatches).map(key => receivedBatches[key]);
    
    if (receivedArray.some(it => !it.batchNumber || it.quantity <= 0)) {
      alert('Please enter valid batch numbers and quantities for all received items.');
      return;
    }

    const res = receivePurchaseOrder(activePOToReceive.id, receivedArray);
    if (res.success) {
      alert('Goods Received Note (GRN) logged. Inventory levels and batches updated.');
      setShowReceiveModal(false);
      setActivePOToReceive(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Purchase Orders & GRN</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Issue Local Purchase Orders (LPOs) to suppliers and verify goods received notifications (GRN)</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1.5 self-start animate-in fade-in"
        >
          <Plus className="w-4 h-4 text-slate-955" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* PO Listing */}
      <div className="bg-white dark:bg-slate-955/50 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-955/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                <th className="px-6 py-4">LPO Code</th>
                <th className="px-6 py-4">Date Issued</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Ordered Items</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
              {purchaseOrders.map(po => {
                const isReceived = po.status === 'received';
                const totalCost = po.items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);

                return (
                  <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors text-xs">
                    <td className="px-6 py-4 font-mono font-bold text-slate-850 dark:text-slate-200">{po.poCode}</td>
                    <td className="px-6 py-4 text-slate-455">{formatDate(po.createdAt)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{po.supplierName}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{po.items.length} items ordered</p>
                        <p className="text-[10px] text-slate-455 font-semibold mt-0.5">Value: {formatCurrency(totalCost)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-[9px] font-bold inline-flex items-center space-x-1 ${
                        isReceived 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-655 dark:text-emerald-450 border border-emerald-500/20' 
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {isReceived ? <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1" /> : <Truck className="w-3 h-3 text-amber-500 mr-1" />}
                        <span>{po.status.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!isReceived ? (
                        <button
                          onClick={() => openReceiveModal(po)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-white dark:bg-slate-900 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg transition-colors border border-transparent shadow"
                        >
                          Receive Goods (GRN)
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create PO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Draft Local Purchase Order (LPO)</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-550"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreatePOSubmit} className="p-6 space-y-4 text-xs text-slate-850 dark:text-slate-250">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Select Supplier *</label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="" disabled>Choose supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Items worksheet */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-1.5">
                  <h4 className="font-bold text-slate-700 dark:text-slate-350">Order Line Items</h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] text-[#0a6c3f] font-bold hover:scale-102 transition-all flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase mb-1">Product *</label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                        >
                          <option value="" disabled>Choose...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>

                      <div className="w-20">
                        <label className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase mb-1">Quantity</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase mb-1">Est. Cost (GHS)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-655 rounded-lg border border-red-200 font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-955 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-955 hover:bg-emerald-400 font-bold rounded-xl shadow-sm"
                >
                  Issue LPO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Goods GRN */}
      {showReceiveModal && activePOToReceive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Goods Received Note (GRN) Entry</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">LPO: {activePOToReceive.poCode} | Supplier: {activePOToReceive.supplierName}</p>
              </div>
              <button onClick={() => setShowReceiveModal(false)} className="text-slate-400 hover:text-slate-655 dark:text-slate-550"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleReceiveSubmit} className="p-6 space-y-4 text-xs text-slate-855 dark:text-slate-200">
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {activePOToReceive.items.map((it, index) => {
                  const data = receivedBatches[index] || {};
                  return (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3 shadow-inner">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-350 text-[11px]">
                        <span>Product: {it.name}</span>
                        <span>Ordered: {it.quantity} units</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase mb-1">Declared Batch Number *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. BAT-YARA-2026"
                            value={data.batchNumber || ''}
                            onChange={(e) => handleReceiveChange(index, 'batchNumber', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase mb-1">Received Qty</label>
                          <input
                            type="number"
                            required
                            value={data.quantity || ''}
                            onChange={(e) => handleReceiveChange(index, 'quantity', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase mb-1">Expiry Date</label>
                          <input
                            type="date"
                            required
                            value={data.expiryDate || ''}
                            onChange={(e) => handleReceiveChange(index, 'expiryDate', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 bg-slate-101 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl shadow-sm"
                >
                  Confirm Goods Receipt (GRN)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
