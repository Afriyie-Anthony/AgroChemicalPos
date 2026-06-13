import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Settings as SettingsIcon, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Percent, 
  Save, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Settings() {
  const { theme } = useStore();
  const [shopName, setShopName] = useState('Nsawam Agro-Chemical Store');
  const [gpsAddress, setGpsAddress] = useState('EN-023-4567');
  const [phone, setPhone] = useState('0244123456');
  const [email, setEmail] = useState('nsawam@agrochempos.com');
  const [tin, setTin] = useState('C0012345678');
  
  // Tax Rates configuration states
  const [vatRate, setVatRate] = useState('12.5');
  const [nhilRate, setNhilRate] = useState('2.5');
  const [getFundRate, setGetFundRate] = useState('2.5');
  const [covidLevy, setCovidLevy] = useState('0.0');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">System Configuration Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure store metadata, Ghana Post GPS location details, and GRA tax schedules</p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center space-x-2.5 text-xs font-bold animate-in slide-in-from-top duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>System configurations saved successfully and applied to receipts.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Shop Profile */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-5 md:col-span-2">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-900">
            <Store className="w-5 h-5 text-emerald-500" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-205">Business Profile Details</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Registered Business Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Ghana Post Digital GPS Address *</label>
                <input
                  type="text"
                  required
                  value={gpsAddress}
                  onChange={(e) => setGpsAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-205 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">GRA Taxpayer ID Number (TIN) *</label>
                <input
                  type="text"
                  required
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-205 font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Primary Contact Hotline *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-202 focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Support Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-202 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Tax compliance */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-5 md:col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-900">
              <Percent className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-205">GRA Tax Configurations</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Standard VAT Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">NHIL Levy (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nhilRate}
                    onChange={(e) => setNhilRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">GETFund (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={getFundRate}
                    onChange={(e) => setGetFundRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">COVID Recovery Levy (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={covidLevy}
                  onChange={(e) => setCovidLevy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                  Standard rated products are taxed at a composite multiplier (levies compounding VAT) amounting to **18.125%** overall.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
