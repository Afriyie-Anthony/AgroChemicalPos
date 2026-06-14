import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2.5 rounded-lg shadow-md border border-slate-800 dark:border-slate-200">
        <p className="text-[14px] font-bold">{data.name}</p>
        <p className="text-[13px] font-black font-mono mt-1 text-emerald-450 dark:text-emerald-600">
          GHS {data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-[12px] font-extrabold text-slate-400 dark:text-slate-500 font-mono">
          {data.percentage.toFixed(1)}% share
        </p>
      </div>
    );
  }
  return null;
};

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

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Category Share Distribution</h3>
      </div>

      {categoryData.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 font-bold">No sales logged in this timeframe.</div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          {/* Radial Recharts donut chart */}
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={48}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="transition-all duration-200 hover:opacity-85 cursor-pointer focus:outline-none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Text centered inside the donut ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider leading-none">Share</span>
              <span className="text-xs font-bold mt-1 text-slate-850 dark:text-slate-200">{categoryData.length} Cats</span>
            </div>
          </div>

          {/* Legends list (Increased readability font size to text-sm) */}
          <div className="flex-1 space-y-2 text-sm w-full">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: cat.color }} 
                  />
                  <span className="text-slate-500 dark:text-slate-400 font-semibold truncate">{cat.name}</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-slate-250 font-mono pl-2">
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
