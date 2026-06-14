import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

export default function CategoryDistributionChart({ filteredTransactions }) {
  // Category Distribution Calculations
  const categoryData = useMemo(() => {
    const breakdown = {};
    let totalSalesVal = 0;

    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        const lineTotal = (item.price - item.discount) * item.quantity;
        breakdown[item.category] = (breakdown[item.category] || 0) + lineTotal;
        totalSalesVal += lineTotal;
      });
    });

    const colors = {
      'Herbicides': '#10b981', // Emerald
      'Fertilizers': '#f59e0b', // Amber
      'Pesticides': '#3b82f6', // Blue
      'Seeds': '#a855f7', // Purple
      'Farm Tools & Equipment': '#64748b', // Slate
      'Organic & Bio Inputs': '#14b8a6' // Teal
    };

    return Object.keys(breakdown).map(cat => {
      const val = breakdown[cat];
      const pct = totalSalesVal > 0 ? (val / totalSalesVal) * 100 : 0;
      return {
        name: cat,
        value: val,
        percentage: pct,
        color: colors[cat] || '#ec4899' // default pink
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // SVG Calculations for Category Donut Chart
  const svgDonutData = useMemo(() => {
    const size = 120;
    const center = size / 2;
    const r = 38;
    const circ = 2 * Math.PI * r;

    let accumulatedPercentage = 0;
    const segments = categoryData.map(c => {
      const strokeDasharray = `${(c.percentage / 100) * circ} ${circ}`;
      const strokeDashoffset = -((accumulatedPercentage / 100) * circ);
      accumulatedPercentage += c.percentage;

      return {
        ...c,
        strokeDasharray,
        strokeDashoffset
      };
    });

    return { size, center, r, segments };
  }, [categoryData]);

  return (
    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-4.5 h-4.5 text-emerald-505" />
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Category Share Distribution</h3>
      </div>

      {categoryData.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-450 font-bold">No sales logged in this timeframe.</div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          {/* Radial donut chart */}
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
              {svgDonutData.segments.map((seg, i) => (
                <circle
                  key={i}
                  cx={svgDonutData.center}
                  cy={svgDonutData.center}
                  r={svgDonutData.r}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="10"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-300 hover:stroke-[12px] cursor-pointer"
                />
              ))}
            </svg>
            {/* Text centered inside the donut ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Share</span>
              <span className="text-sm font-bold mt-0.5 text-slate-800 dark:text-slate-200">{categoryData.length} Cats</span>
            </div>
          </div>

          {/* Legends list */}
          <div className="flex-1 space-y-2 text-xs w-full">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: cat.color }} 
                  />
                  <span className="text-slate-500 dark:text-slate-400 truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 pl-2">
                  {cat.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
