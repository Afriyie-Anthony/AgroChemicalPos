import React from 'react';
import { Coins } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

export default function PaymentBreakdown({ payments, totalSales }) {
  const cashPercent = totalSales ? (payments.cashSales / totalSales) * 100 : 0;
  const momoPercent = totalSales ? (payments.momoSales / totalSales) * 100 : 0;

  return (
    <div className="lg:col-span-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Coins className="w-4.5 h-4.5 text-emerald-500" />
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Revenues Split (Cash & MoMo)</h3>
        </div>

        <div className="space-y-4.5 pt-2">
          {/* Cash collections */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-500">Cash Collections</span>
              <span className="font-bold text-slate-850 dark:text-slate-100">
                {formatCurrency(payments.cashSales)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${cashPercent}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 mt-1 block">
              {cashPercent.toFixed(0)}% of filtered checkout sales
            </span>
          </div>

          {/* MoMo collections */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-500">Mobile Money (MoMo)</span>
              <span className="font-bold text-slate-850 dark:text-slate-100">
                {formatCurrency(payments.momoSales)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${momoPercent}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 mt-1 block">
              {momoPercent.toFixed(0)}% of filtered checkout sales
            </span>
          </div>
        </div>
      </div>

      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 leading-relaxed">
        * Calculations reflect only standard cash transactions and instant mobile network reference transfers.
      </p>
    </div>
  );
}
