import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Truck, Plus, Mail, Phone, MapPin, X, LayoutGrid, List, Info, Trash2 } from 'lucide-react';

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, purchaseOrders, products } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeSupplierForDetails, setActiveSupplierForDetails] = useState(null);

  // Compute supplied products list
  const suppliedProducts = useMemo(() => {
    if (!activeSupplierForDetails) return [];
    
    // Gather unique product IDs from purchase orders for this supplier
    const productIds = new Set();
    purchaseOrders
      .filter(po => po.supplierId === activeSupplierForDetails.id)
      .forEach(po => {
        po.items?.forEach(item => {
          if (item.productId) {
            productIds.add(item.productId);
          }
        });
      });

    // Map to actual product objects
    return Array.from(productIds).map(id => {
      const prod = products.find(p => p.id === id);
      if (prod) {
        return {
          id: prod.id,
          name: prod.name,
          brand: prod.brand,
          category: prod.category
        };
      }
      return {
        id,
        name: 'Unknown Product',
        brand: 'N/A',
        category: 'N/A'
      };
    });
  }, [activeSupplierForDetails, purchaseOrders, products]);

  // Form inputs
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    addSupplier({ name, contactPerson, phone, email, location });
    setShowAddModal(false);
    
    // Clear inputs
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setLocation('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!activeSupplier) return;

    updateSupplier(activeSupplier.id, {
      name,
      contactPerson,
      phone,
      email,
      location
    });
    
    setActiveSupplier(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setLocation('');
  };

  const openEditModal = (sup) => {
    setActiveSupplier(sup);
    setName(sup.name);
    setContactPerson(sup.contactPerson);
    setPhone(sup.phone);
    setEmail(sup.email);
    setLocation(sup.location);
  };

  const handleDeleteSupplier = (sup) => {
    if (window.confirm(`Are you sure you want to delete supplier "${sup.name}"?`)) {
      deleteSupplier(sup.id);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Supplier Contacts Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Maintain agrochemical wholesale suppliers lists and contact details</p>
        </div>
        <div className="flex items-center space-x-3 self-start">
          {/* View Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-slate-955" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Supplier List Render */}
      {viewMode === 'card' ? (
        /* Supplier Grid list */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map(sup => (
            <div key={sup.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="space-y-2.5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm leading-tight">{sup.name}</h3>
                  <span className="p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 rounded-lg">
                    <Truck className="w-4 h-4 text-emerald-500" />
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Contact: {sup.contactPerson}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-900/60 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400 truncate max-w-[170px]" />
                    <span className="truncate">{sup.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setActiveSupplierForDetails(sup);
                    setShowDetailsModal(true);
                  }}
                  className="py-2 flex items-center justify-center space-x-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 transition-colors shadow-sm focus:outline-none"
                  title="View Details"
                >
                  <Info className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => openEditModal(sup)}
                  className="py-2 flex items-center justify-center space-x-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 transition-colors shadow-sm focus:outline-none"
                  title="Edit Supplier"
                >
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteSupplier(sup)}
                  className="py-2 flex items-center justify-center space-x-1 bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-500/20 dark:border-rose-500/30 text-[10px] font-bold rounded-lg text-rose-600 dark:text-rose-400 transition-colors shadow-sm focus:outline-none"
                  title="Delete Supplier"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Supplier Table View */
        <div className="premium-table-container">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th className="px-6 py-4">Supplier Name</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Office Location</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {suppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors text-xs">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-250">{sup.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-450">{sup.contactPerson || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-450">{sup.phone}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-450">{sup.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-450">{sup.location || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setActiveSupplierForDetails(sup);
                            setShowDetailsModal(true);
                          }}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center space-x-1"
                          title="View Details"
                        >
                          <Info className="w-3 h-3 text-emerald-500" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => openEditModal(sup)}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(sup)}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-500/20 dark:border-rose-500/30 text-[10px] font-bold rounded-lg text-rose-600 dark:text-rose-400 transition-colors shadow-sm flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Supplier */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Add Wholesale Supplier</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-550"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs text-slate-850 dark:text-slate-250">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yara Ghana Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Daniel Alabi"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0302123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. sales@yara.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Office Location</label>
                <input
                  type="text"
                  placeholder="e.g. Tema Industrial Area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-105 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Supplier */}
      {activeSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Edit Supplier Details</h2>
              <button onClick={() => setActiveSupplier(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-550"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs text-slate-850 dark:text-slate-250">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yara Ghana Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase mb-1.5">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Daniel Alabi"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0302123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. sales@yara.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Office Location</label>
                <input
                  type="text"
                  placeholder="e.g. Tema Industrial Area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveSupplier(null)}
                  className="px-4 py-2 bg-slate-105 dark:bg-slate-955 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: View Details */}
      {showDetailsModal && activeSupplierForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/10">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Supplier Profile Details</h2>
              </div>
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  setActiveSupplierForDetails(null);
                }} 
                className="text-slate-400 hover:text-slate-600 dark:text-slate-550"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs text-slate-850 dark:text-slate-250">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex flex-col py-1.5 border-b border-slate-100 dark:border-slate-855">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:border-slate-500 mb-0.5">Supplier ID</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{activeSupplierForDetails.id}</span>
                </div>
                
                <div className="flex flex-col py-1.5 border-b border-slate-100 dark:border-slate-855">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:border-slate-500 mb-0.5">Contact Person</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{activeSupplierForDetails.contactPerson || 'N/A'}</span>
                </div>

                <div className="col-span-2 flex flex-col py-1.5 border-b border-slate-100 dark:border-slate-855">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:border-slate-500 mb-0.5">Supplier Name</span>
                  <span className="font-bold text-slate-850 dark:text-slate-250">{activeSupplierForDetails.name}</span>
                </div>

                <div className="flex flex-col py-1.5 border-b border-slate-100 dark:border-slate-855">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:border-slate-500 mb-0.5">Phone Number</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{activeSupplierForDetails.phone}</span>
                </div>

                <div className="flex flex-col py-1.5 border-b border-slate-100 dark:border-slate-855">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:border-slate-500 mb-0.5">Email Address</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate" title={activeSupplierForDetails.email}>
                    {activeSupplierForDetails.email || 'N/A'}
                  </span>
                </div>

                <div className="col-span-2 flex flex-col py-1.5 border-b border-slate-100 dark:border-slate-855">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:border-slate-500 mb-0.5">Office Location</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{activeSupplierForDetails.location || 'N/A'}</span>
                </div>
              </div>

              {/* Supplied Products List */}
              <div className="pt-3 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Supplied Products</span>
                {suppliedProducts.length > 0 ? (
                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {suppliedProducts.map(prod => (
                      <div key={prod.id} className="flex justify-between items-center px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{prod.name}</span>
                          {prod.brand && <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{prod.brand}</span>}
                        </div>
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-md uppercase tracking-wider">{prod.category}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50 dark:bg-slate-955/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <span className="text-slate-400 dark:text-slate-500 italic text-xs">No products associated with this supplier yet</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setActiveSupplierForDetails(null);
                  }}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-855 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
