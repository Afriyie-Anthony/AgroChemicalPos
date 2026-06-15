import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Tags, Plus, X, Edit, Trash2, AlertTriangle, Layers } from 'lucide-react';

export default function Categories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategoryToEdit, setActiveCategoryToEdit] = useState(null);
  const [name, setName] = useState('');

  // Count products associated with each category
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const count = products.filter(p => p.category === cat).length;
      return { name: cat, count };
    });
  }, [categories, products]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) {
      alert('This category name already exists.');
      return;
    }

    addCategory(trimmed);
    setShowAddModal(false);
    setName('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !activeCategoryToEdit) return;

    if (trimmed === activeCategoryToEdit) {
      setActiveCategoryToEdit(null);
      setName('');
      return;
    }

    if (categories.includes(trimmed)) {
      alert('This category name already exists.');
      return;
    }

    updateCategory(activeCategoryToEdit, trimmed);
    setActiveCategoryToEdit(null);
    setName('');
  };

  const openEditModal = (cat) => {
    setActiveCategoryToEdit(cat);
    setName(cat);
  };

  const handleDelete = (catName, count) => {
    if (count > 0) {
      alert(`Cannot delete category "${catName}" because it contains ${count} associated products. Please reassign the products to another category before deleting this one.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${catName}"?`)) {
      deleteCategory(catName);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <Tags className="w-6 h-6 text-emerald-500" />
            <span>Product Categories</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage agrochemical inventory classification groups</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4 text-slate-955" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid/Table */}
      <div className="premium-table-container">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th className="px-6 py-4">Classification Group</th>
                <th className="px-6 py-4 text-center">Associated Products</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryStats.map(stat => (
                <tr key={stat.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors text-xs">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>{stat.name}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                      stat.count > 0 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold' 
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500'
                    }`}>
                      {stat.count} products
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(stat.name)}
                        className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Rename Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(stat.name, stat.count)}
                        className={`p-1.5 border rounded-lg transition-colors ${
                          stat.count > 0 
                            ? 'bg-slate-100 dark:bg-slate-950 text-slate-350 dark:text-slate-650 border-slate-200 dark:border-slate-850 cursor-not-allowed'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border-rose-500/20 dark:border-rose-500/30 text-rose-600 dark:text-rose-400'
                        }`}
                        title={stat.count > 0 ? "Cannot delete category containing products" : "Delete Category"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Category */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Add Classification Group</h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setName('');
                }} 
                className="text-slate-400 hover:text-slate-600 dark:text-slate-550"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs text-slate-850 dark:text-slate-250">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adjuvants & Surfactants"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setName('');
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-955 hover:bg-emerald-400 font-bold rounded-xl shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Category */}
      {activeCategoryToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">Rename Category</h2>
              <button 
                onClick={() => {
                  setActiveCategoryToEdit(null);
                  setName('');
                }} 
                className="text-slate-400 hover:text-slate-600 dark:text-slate-550"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs text-slate-850 dark:text-slate-250">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">New Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adjuvants"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3.5 rounded-xl">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-[10px] font-medium leading-relaxed">
                  <strong>Warning:</strong> Renaming this category will perform a cascading update on all products currently assigned to "{activeCategoryToEdit}".
                </p>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategoryToEdit(null);
                    setName('');
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-955 hover:bg-emerald-400 font-bold rounded-xl shadow-sm"
                >
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
