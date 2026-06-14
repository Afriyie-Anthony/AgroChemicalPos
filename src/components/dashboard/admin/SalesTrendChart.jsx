import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

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

  // SVG Calculations for Bar Trend Chart
  const svgTrendData = useMemo(() => {
    const width = 1000;
    const height = 190;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 28;
    const paddingBottom = 25;

    const maxVal = Math.max(...salesTrendPoints.map(p => p.value), 200); // minimum scale limit
    const innerWidth = width - paddingLeft - paddingRight;
    const innerHeight = height - paddingTop - paddingBottom;

    const numPoints = salesTrendPoints.length;
    const step = innerWidth / numPoints;
    const barWidth = step * 0.55; // Sized nicely to leave room between bars

    const bars = salesTrendPoints.map((p, idx) => {
      const centerX = paddingLeft + (idx + 0.5) * step;
      const x = centerX - barWidth / 2;
      const valHeight = (p.value / maxVal) * innerHeight;
      const y = paddingTop + innerHeight - valHeight;
      return { 
        x, 
        y, 
        width: barWidth, 
        height: valHeight, 
        label: p.label, 
        value: p.value, 
        centerX 
      };
    });

    return { bars, width, height, maxVal, innerHeight, paddingTop, paddingLeft, innerWidth };
  }, [salesTrendPoints]);

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="w-4.5 h-4.5 text-emerald-500" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Revenue Trend</h3>
        </div>
        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">
          Live updates
        </span>
      </div>

      <div className="relative pt-2">
        <svg 
          viewBox={`0 0 ${svgTrendData.width} ${svgTrendData.height}`} 
          className="w-full h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Y Axis Gridlines and Labels */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = svgTrendData.paddingTop + svgTrendData.innerHeight * (1 - ratio);
            const labelVal = Math.round(svgTrendData.maxVal * ratio);
            return (
              <g key={i} className="opacity-40">
                <line 
                  x1={svgTrendData.paddingLeft} 
                  y1={y} 
                  x2={svgTrendData.width - 15} 
                  y2={y} 
                  className="stroke-slate-200 dark:stroke-slate-850 stroke-1" 
                  strokeDasharray="4,4"
                />
                <text 
                  x={svgTrendData.paddingLeft - 8} 
                  y={y + 3} 
                  textAnchor="end" 
                  className="fill-slate-400 dark:fill-slate-500 font-bold text-[8px] font-mono"
                >
                  {labelVal >= 1000 ? `${(labelVal / 1000).toFixed(1)}k` : labelVal}
                </text>
              </g>
            );
          })}

          {/* Bars Rendering */}
          {svgTrendData.bars.map((bar, i) => (
            <g key={i} className="group cursor-pointer">
              {/* Highlight background column effect on hover */}
              <rect
                x={bar.centerX - (bar.width * 0.9)}
                y={svgTrendData.paddingTop - 6}
                width={bar.width * 1.8}
                height={svgTrendData.innerHeight + 12}
                className="fill-slate-100/50 dark:fill-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                rx="4"
              />

              {/* The SVG bar rectangle */}
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={Math.max(bar.height, 2)}
                fill="url(#barGradient)"
                rx="3.5"
                className="transition-all duration-200 group-hover:brightness-110"
              />

              {/* Tooltip showing value on hover */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect
                  x={bar.centerX - 45}
                  y={bar.y - 23}
                  width="90"
                  height="16"
                  rx="4"
                  className="fill-slate-900 dark:fill-slate-100 filter drop-shadow-sm"
                />
                <text 
                  x={bar.centerX} 
                  y={bar.y - 12} 
                  textAnchor="middle" 
                  className="fill-white dark:fill-slate-900 text-[8px] font-bold font-mono"
                >
                  GHS {bar.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </text>
              </g>

              {/* Label at the bottom */}
              <text 
                x={bar.centerX} 
                y={svgTrendData.height - 8} 
                textAnchor="middle" 
                className="fill-slate-400 dark:fill-slate-500 font-bold text-[8px]"
              >
                {bar.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
