import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

const BAR_COLORS = [
  { stop0: '#10b981', stop100: '#047857' }, // Emerald
  { stop0: '#3b82f6', stop100: '#1d4ed8' }, // Blue
  { stop0: '#f97316', stop100: '#ea580c' }, // Orange
  { stop0: '#8b5cf6', stop100: '#6d28d9' }, // Violet / Purple
  { stop0: '#ec4899', stop100: '#db2777' }, // Pink
  { stop0: '#06b6d4', stop100: '#0891b2' }, // Cyan
  { stop0: '#14b8a6', stop100: '#0d9488' }, // Teal
  { stop0: '#f59e0b', stop100: '#d97706' }, // Amber
  { stop0: '#6366f1', stop100: '#4f46e5' }, // Indigo
  { stop0: '#84cc16', stop100: '#65a30d' }, // Lime
  { stop0: '#22c55e', stop100: '#16a34a' }, // Green
  { stop0: '#eab308', stop100: '#ca8a04' }, // Yellow
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-md border border-slate-800 dark:border-slate-200">
        <p className="text-[15px] font-bold font-mono">
          GHS {payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function SalesTrendChart({ filteredTransactions, timeFilter }) {
  // Dynamic Sales Trend Bar Data Points Generator
  const salesTrendPoints = useMemo(() => {
    let intervals = [];

    if (timeFilter === 'day') {
      // 6 intervals throughout the day
      intervals = [
        { label: '08:00', startHour: 0, endHour: 9, value: 0 },
        { label: '10:00', startHour: 9, endHour: 11, value: 0 },
        { label: '12:00', startHour: 11, endHour: 13, value: 0 },
        { label: '14:00', startHour: 13, endHour: 15, value: 0 },
        { label: '16:00', startHour: 15, endHour: 17, value: 0 },
        { label: '18:00', startHour: 17, endHour: 24, value: 0 }
      ];

      filteredTransactions.forEach(t => {
        const h = new Date(t.createdAt).getHours();
        const interval = intervals.find(i => h >= i.startHour && h < i.endHour);
        if (interval) interval.value += t.total;
      });

    } else if (timeFilter === 'month') {
      // Month: 4 blocks of weeks (Days 1-7, 8-14, 15-21, 22+)
      intervals = [
        { label: 'Week 1', startDay: 1, endDay: 7, value: 0 },
        { label: 'Week 2', startDay: 8, endDay: 14, value: 0 },
        { label: 'Week 3', startDay: 15, endDay: 21, value: 0 },
        { label: 'Week 4', startDay: 22, endDay: 32, value: 0 }
      ];

      filteredTransactions.forEach(t => {
        const day = new Date(t.createdAt).getDate();
        const interval = intervals.find(i => day >= i.startDay && day <= i.endDay);
        if (interval) interval.value += t.total;
      });

    } else if (timeFilter === 'year') {
      // Year: 12 months calendar aggregates (Jan - Dec)
      intervals = [
        { label: 'Jan', monthIndex: 0, value: 0 },
        { label: 'Feb', monthIndex: 1, value: 0 },
        { label: 'Mar', monthIndex: 2, value: 0 },
        { label: 'Apr', monthIndex: 3, value: 0 },
        { label: 'May', monthIndex: 4, value: 0 },
        { label: 'Jun', monthIndex: 5, value: 0 },
        { label: 'Jul', monthIndex: 6, value: 0 },
        { label: 'Aug', monthIndex: 7, value: 0 },
        { label: 'Sep', monthIndex: 8, value: 0 },
        { label: 'Oct', monthIndex: 9, value: 0 },
        { label: 'Nov', monthIndex: 10, value: 0 },
        { label: 'Dec', monthIndex: 11, value: 0 }
      ];

      filteredTransactions.forEach(t => {
        const month = new Date(t.createdAt).getMonth();
        const interval = intervals.find(i => i.monthIndex === month);
        if (interval) interval.value += t.total;
      });
    }

    return intervals;
  }, [filteredTransactions, timeFilter]);

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="w-4.5 h-4.5 text-emerald-500" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Revenue Trend</h3>
        </div>
        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">
          Live updates
        </span>
      </div>

      <div className="relative pt-2 w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={salesTrendPoints}
            margin={{ top: 25, right: 15, left: -15, bottom: 0 }}
          >
            <defs>
              {/* Dynamic linear gradients for each bar item */}
              {salesTrendPoints.map((entry, i) => {
                const color = BAR_COLORS[i % BAR_COLORS.length];
                return (
                  <linearGradient key={i} id={`rechartsBarGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color.stop0} stopOpacity={1} />
                    <stop offset="100%" stopColor={color.stop100} stopOpacity="0.3" />
                  </linearGradient>
                );
              })}
            </defs>

            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 16, fontWeight: 'bold' }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 16, fontWeight: 'extrabold', fontFamily: 'monospace' }}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
            />

            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              content={<CustomTooltip />}
            />

            <Bar dataKey="value" radius={[4, 4, 0, 0]} minPointSize={2}>
              {salesTrendPoints.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={`url(#rechartsBarGrad-${i})`} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                formatter={(val) => (val > 0 ? `GHS ${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '')}
                className="fill-slate-700 dark:fill-slate-200 text-[16px] font-bold font-mono"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
