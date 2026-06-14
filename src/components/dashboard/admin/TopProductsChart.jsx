import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTopProductsTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2.5 rounded-lg shadow-md border border-slate-800 dark:border-slate-200">
        <p className="text-[14px] font-bold text-slate-100 dark:text-slate-800">{data.name}</p>
        <p className="text-[13px] font-black font-mono mt-1 text-emerald-450 dark:text-emerald-600">
          {data.qty} Units Sold
        </p>
      </div>
    );
  }
  return null;
};

const truncateLabel = (label) => {
  if (label && label.length > 16) {
    return `${label.substring(0, 14)}...`;
  }
  return label;
};

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

  return (
    <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <Layers className="w-4.5 h-4.5 text-emerald-500" />
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Top Selling Products</h3>
      </div>

      {topSellingProducts.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 font-bold">No sales logged in this timeframe.</div>
      ) : (
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topSellingProducts}
              layout="vertical"
              margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="topProductsGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.35" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />

              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }}
              />

              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                width={120}
                tickFormatter={truncateLabel}
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }}
              />

              <Tooltip content={<CustomTopProductsTooltip />} />

              <Bar
                dataKey="qty"
                fill="url(#topProductsGrad)"
                radius={[0, 4, 4, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
