import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';

export default function TopProductsChart({ filteredTransactions }) {
  // Top Selling Products calculations
  const topSellingProducts = useMemo(() => {
    const counts = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      });
    });

    return Object.keys(counts)
      .map(name => ({ name, qty: counts[name] }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
  }, [filteredTransactions]);

  const maxQty = useMemo(() => {
    if (topSellingProducts.length === 0) return 1;
    return Math.max(...topSellingProducts.map(x => x.qty), 1);
  }, [topSellingProducts]);

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <Layers className="w-4.5 h-4.5 text-emerald-500" />
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Top Selling Products</h3>
      </div>

      {topSellingProducts.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-450 font-bold">No sales logged in this timeframe.</div>
      ) : (
        <div className="space-y-4 pt-1">
          {topSellingProducts.map((p, i) => {
            const percent = (p.qty / maxQty) * 100;
            return (
              <div key={i} className="text-xs">
                <div className="flex justify-between font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-250">{p.name}</span>
                  <span className="text-slate-850 dark:text-slate-100">{p.qty} Units Sold</span>
                </div>
                <div className="w-full bg-slate-50 dark:bg-slate-900 h-2 border border-slate-100 dark:border-slate-850 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
