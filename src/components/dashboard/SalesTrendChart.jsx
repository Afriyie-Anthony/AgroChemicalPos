import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

export default function SalesTrendChart({ filteredTransactions, timeFilter }) {
  // Dynamic Sales Trend Line Data Points Generator
  const salesTrendPoints = useMemo(() => {
    let intervals = [];

    if (timeFilter === 'today') {
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

    } else if (timeFilter === 'week') {
      // Last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      
      // Initialize intervals for past 7 days in order
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        intervals.push({ label: days[d.getDay()], dateStr: d.toDateString(), value: 0 });
      }

      filteredTransactions.forEach(t => {
        const txDayStr = new Date(t.createdAt).toDateString();
        const interval = intervals.find(i => i.dateStr === txDayStr);
        if (interval) interval.value += t.total;
      });

    } else {
      // Month: 6 blocks of 5 days
      intervals = [
        { label: 'Days 1-5', startDay: 1, endDay: 5, value: 0 },
        { label: 'Days 6-10', startDay: 6, endDay: 10, value: 0 },
        { label: 'Days 11-15', startDay: 11, endDay: 15, value: 0 },
        { label: 'Days 16-20', startDay: 16, endDay: 20, value: 0 },
        { label: 'Days 21-25', startDay: 21, endDay: 25, value: 0 },
        { label: 'Days 26+', startDay: 26, endDay: 32, value: 0 }
      ];

      filteredTransactions.forEach(t => {
        const day = new Date(t.createdAt).getDate();
        const interval = intervals.find(i => day >= i.startDay && day <= i.endDay);
        if (interval) interval.value += t.total;
      });
    }

    return intervals;
  }, [filteredTransactions, timeFilter]);

  // SVG Calculations for Line Trend Chart
  const svgTrendData = useMemo(() => {
    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const maxVal = Math.max(...salesTrendPoints.map(p => p.value), 200); // minimum scale limit
    const innerWidth = width - paddingLeft - paddingRight;
    const innerHeight = height - paddingTop - paddingBottom;

    const coords = salesTrendPoints.map((p, idx) => {
      const x = paddingLeft + (idx / (salesTrendPoints.length - 1)) * innerWidth;
      const y = paddingTop + innerHeight - (p.value / maxVal) * innerHeight;
      return { x, y, label: p.label, value: p.value };
    });

    let linePath = '';
    let areaPath = '';

    if (coords.length > 0) {
      // Build line path
      linePath = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ');
      // Build area path (closes at bottom edge)
      areaPath = `${linePath} L ${coords[coords.length - 1].x} ${paddingTop + innerHeight} L ${coords[0].x} ${paddingTop + innerHeight} Z`;
    }

    return { coords, linePath, areaPath, width, height, maxVal, innerHeight, paddingTop, paddingLeft, innerWidth };
  }, [salesTrendPoints]);

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="w-4.5 h-4.5 text-emerald-505" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Revenues Trend curve</h3>
        </div>
        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">
          Live updates
        </span>
      </div>

      <div className="relative pt-2">
        {/* Custom SVG Line Chart */}
        <svg 
          viewBox={`0 0 ${svgTrendData.width} ${svgTrendData.height}`} 
          className="w-full h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
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
                  {labelVal > 1000 ? `${(labelVal / 1000).toFixed(1)}k` : labelVal}
                </text>
              </g>
            );
          })}

          {/* Area path under line */}
          {svgTrendData.areaPath && (
            <path d={svgTrendData.areaPath} fill="url(#salesAreaGradient)" />
          )}

          {/* Highlight path line */}
          {svgTrendData.linePath && (
            <path 
              d={svgTrendData.linePath} 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Data points markers */}
          {svgTrendData.coords.map((c, i) => (
            <g key={i} className="group/dot cursor-pointer">
              <circle 
                cx={c.x} 
                cy={c.y} 
                r="4" 
                className="fill-emerald-500 stroke-white dark:stroke-slate-950 stroke-2 hover:r-5 transition-all" 
              />
              <text 
                x={c.x} 
                y={c.y - 8} 
                textAnchor="middle" 
                className="fill-slate-700 dark:fill-slate-350 text-[8px] font-bold font-mono opacity-0 group-hover/dot:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow"
              >
                {c.value.toFixed(0)}
              </text>
              <text 
                x={c.x} 
                y={svgTrendData.height - 8} 
                textAnchor="middle" 
                className="fill-slate-450 dark:fill-slate-500 font-bold text-[8px]"
              >
                {c.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
