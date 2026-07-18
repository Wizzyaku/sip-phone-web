import { useState, memo } from 'react';
import {
  Search,
  Filter,
  Phone,
  MessageSquare,
  Image as ImageIcon,
  MoreVertical,
  Plus,
  Check,
  X,
  PhoneForwarded,
  Voicemail,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NumberItem {
  id: string;
  number: string;
  label: string;
  flag: string;
  features: ('voice' | 'sms' | 'mms')[];
  active: boolean;
  forwarding?: string;
  voicemail?: boolean;
  monthlyCost: number;
}

const initialNumbers: NumberItem[] = [
  {
    id: '1',
    number: '+1 (555) 019-2834',
    label: 'Sales Main Line',
    flag: '🇺🇸',
    features: ['voice', 'sms', 'mms'],
    active: true,
    forwarding: '+1 (555) 999...',
    monthlyCost: 7.0,
  },
  {
    id: '2',
    number: '+44 20 7946 0958',
    label: 'UK Support Desk',
    flag: '🇬🇧',
    features: ['voice'],
    active: true,
    voicemail: true,
    monthlyCost: 7.0,
  },
];

const availableNumbers = [
  { id: 'a1', number: '+1 (310) 555-0199', flag: '🇺🇸', features: ['Voice', 'SMS'], price: 7.0 },
  { id: 'a2', number: '+1 (212) 555-0844', flag: '🇺🇸', features: ['Voice', 'SMS', 'MMS'], price: 8.5 },
  { id: 'a3', number: '+1 (415) 555-0912', flag: '🇺🇸', features: ['Voice', 'SMS'], price: 7.0 },
  { id: 'a4', number: '+44 20 7946 0712', flag: '🇬🇧', features: ['Voice', 'SMS'], price: 8.0 },
];

const countryFilters = [
  { label: '🇺🇸 US (+1)', active: true },
  { label: '🇬🇧 UK (+44)', active: false },
  { label: '🇨🇦 CA (+1)', active: false },
  { label: 'Toll-Free', active: false },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-block w-8 h-5 rounded-full transition-colors duration-300 shrink-0',
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white border-4 shadow-sm transition-all duration-300',
          checked ? 'translate-x-3 border-indigo-600' : 'border-slate-300'
        )}
      />
    </button>
  );
}

function FeatureBadge({ icon: Icon, label, color }: { icon: React.ComponentType<{ className?: string }>; label: string; color: string }) {
  return (
    <span className={cn('px-2 py-0.5 rounded-[6px] text-[9px] font-extrabold border uppercase tracking-wide flex items-center gap-1', color)}>
      <Icon className="w-2.5 h-2.5" /> {label}
    </span>
  );
}

export function PhoneNumbers() {
  const [numbers, setNumbers] = useState(initialNumbers);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState(0);

  const totalMonthly = numbers.reduce((sum, n) => sum + n.monthlyCost, 0);

  const toggleActive = (id: string) => {
    setNumbers((prev) => prev.map((n) => (n.id === id ? { ...n, active: !n.active } : n)));
  };

  const selectNumber = (id: string, price: number) => {
    setSelectedNumber(id);
    setSelectedPrice(price);
  };

  const featureBadgeConfig = {
    voice: { icon: Phone, label: 'Voice', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    sms: { icon: MessageSquare, label: 'SMS', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    mms: { icon: ImageIcon, label: 'MMS', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F0F4F8] dark:bg-slate-950">
      {/* ========================================= */}
      {/* MOBILE LAYOUT (hidden on lg+)             */}
      {/* ========================================= */}
      <div className="lg:hidden px-4 pt-3 pb-[10px] flex flex-col gap-3.5">
        {/* Hero Summary Card */}
        <div className="animate-fade-in shrink-0 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[20px] shadow-[0_8px_25px_rgba(79,70,229,0.2)] p-4 flex flex-col gap-4">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl z-0" />
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Active Lines</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-extrabold text-white tracking-tight leading-none">{numbers.length}</span>
                <span className="text-[11px] font-bold text-white/90">Numbers</span>
              </div>
            </div>
            <div className="text-right flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Monthly Cost</span>
              <span className="text-[14px] font-extrabold text-white">${totalMonthly.toFixed(2)}</span>
            </div>
          </div>
          <div className="relative z-10">
            <button
              onClick={() => setBuyModalOpen(true)}
              className="w-full h-11 bg-white text-indigo-600 hover:bg-slate-50 rounded-[14px] text-[13px] font-extrabold flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-4 h-4" /> Get New Number
            </button>
          </div>
        </div>

        {/* Active Numbers List */}
        <div className="animate-fade-in animate-delay-100 shrink-0 flex flex-col gap-2.5 mt-1">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">Your Portfolio</h3>
            <button className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {numbers.map((n) => (
              <div key={n.id} className="bg-white border border-slate-200/80 rounded-[20px] shadow-[0_4px_15px_rgba(15,23,42,0.03)] p-3.5 flex flex-col gap-3 dark:bg-slate-900 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 text-[18px] flex items-center justify-center shrink-0 border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-600">
                      {n.flag}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{n.number}</h4>
                      <span className="text-[10px] font-bold text-slate-500">{n.label}</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95 dark:bg-slate-800 dark:text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-1.5 overflow-hidden">
                  {n.features.map((f) => {
                    const cfg = featureBadgeConfig[f];
                    return <FeatureBadge key={f} icon={cfg.icon} label={cfg.label} color={cfg.color} />;
                  })}
                </div>

                <div className="pt-3 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Toggle checked={n.active} onChange={() => toggleActive(n.id)} />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{n.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  {n.forwarding ? (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-[8px] border border-slate-100 flex items-center gap-1 dark:bg-slate-800 dark:border-slate-700">
                      <PhoneForwarded className="w-3 h-3" /> Fwd: {n.forwarding}
                    </span>
                  ) : n.voicemail ? (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-[8px] border border-slate-100 flex items-center gap-1 dark:bg-slate-800 dark:border-slate-700">
                      <Voicemail className="w-3 h-3" /> Send to Voicemail
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buy Number Modal - Mobile */}
      {buyModalOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setBuyModalOpen(false)} />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[28px] flex flex-col max-h-[85vh] dark:bg-slate-900">
            <div className="shrink-0 pt-2 pb-3 px-5 border-b border-slate-100 dark:border-slate-700 flex flex-col items-center relative">
              <div className="w-10 h-1.5 bg-slate-200 rounded-full mb-3 dark:bg-slate-700" />
              <h2 className="text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Get a New Number</h2>
              <button onClick={() => setBuyModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 active:scale-95 dark:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="shrink-0 p-4 bg-slate-50/50 flex flex-col gap-3 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
              <div className="relative w-full shadow-sm">
                <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none w-4 h-4 my-auto" />
                <input
                  type="text"
                  placeholder="Search Country, Area Code or Number..."
                  className="w-full h-11 bg-white border border-slate-200 rounded-[14px] pl-10 pr-3 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {countryFilters.map((cf, i) => (
                  <button
                    key={cf.label}
                    onClick={() => setActiveFilter(i)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-[10px] text-[11px] font-bold whitespace-nowrap transition-all',
                      activeFilter === i
                        ? 'bg-slate-800 text-white shadow-sm dark:bg-indigo-600'
                        : 'bg-white border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    )}
                  >
                    {cf.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-grow overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
              <p className="text-[11px] font-bold text-slate-500 mb-1 dark:text-slate-400">Available Numbers in <span className="text-slate-800 dark:text-slate-100">United States</span></p>
              {availableNumbers.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => selectNumber(opt.id, opt.price)}
                  className={cn(
                    'relative p-3 border-2 rounded-[16px] cursor-pointer flex items-center justify-between transition-all active:scale-[0.98]',
                    selectedNumber === opt.id
                      ? 'border-indigo-600 bg-indigo-50/30'
                      : 'border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-50 text-[16px] flex items-center justify-center shrink-0 border border-slate-200 dark:bg-slate-700 dark:border-slate-600">
                      {opt.flag}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100">{opt.number}</h4>
                      <div className="flex gap-1 mt-1">
                        {opt.features.map((f) => (
                          <span key={f} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 rounded dark:bg-slate-700 dark:text-slate-300">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[13px] font-extrabold text-indigo-600">${opt.price.toFixed(2)}<span className="text-[9px] text-slate-400">/mo</span></span>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      selectedNumber === opt.id ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 dark:border-slate-600'
                    )}>
                      {selectedNumber === opt.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="shrink-0 p-4 border-t border-slate-100 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.03)] dark:bg-slate-900 dark:border-slate-700">
              <button
                disabled={!selectedNumber}
                className={cn(
                  'w-full h-12 rounded-[16px] text-[14px] font-extrabold flex items-center justify-center transition-all',
                  selectedNumber
                    ? 'bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                )}
              >
                {selectedNumber ? `Pay $${selectedPrice?.toFixed(2)}/mo` : 'Select a Number'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* DESKTOP LAYOUT (hidden below lg)          */}
      {/* ========================================= */}
      <div className="hidden lg:block p-8 pb-8">
        {/* Header */}
        <div className="mb-8 flex flex-row items-end justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Phone Numbers</h2>
            <p className="text-sm text-slate-500 mt-1 leading-tight">Manage your virtual numbers across all regions.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search number or label..."
                className="h-11 w-64 bg-white border border-slate-200 rounded-xl pl-10 pr-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <Filter className="w-4 h-4" /> All Countries
            </button>
            <button
              onClick={() => setBuyModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-extrabold shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:bg-indigo-500 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Get New Number
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="premium-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Active Lines</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-none mt-1">{numbers.filter((n) => n.active).length}</h3>
            </div>
          </div>
          <div className="premium-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Total Numbers</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-none mt-1">{numbers.length}</h3>
            </div>
          </div>
          <div className="premium-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Monthly Cost</span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-none mt-1">${totalMonthly.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* Numbers Grid */}
        <div className="grid grid-cols-2 gap-6">
          {numbers.map((n) => (
            <div key={n.id} className="premium-card rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-50 text-[22px] flex items-center justify-center shrink-0 border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-600">
                    {n.flag}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{n.number}</h4>
                    <span className="text-xs font-bold text-slate-500">{n.label}</span>
                  </div>
                </div>
                <button className="w-9 h-9 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors dark:bg-slate-800 dark:text-slate-400">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                {n.features.map((f) => {
                  const cfg = featureBadgeConfig[f];
                  return <FeatureBadge key={f} icon={cfg.icon} label={cfg.label} color={cfg.color} />;
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Toggle checked={n.active} onChange={() => toggleActive(n.id)} />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{n.active ? 'Active' : 'Inactive'}</span>
                </div>
                {n.forwarding ? (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 dark:bg-slate-800 dark:border-slate-700">
                    <PhoneForwarded className="w-3.5 h-3.5" /> Fwd: {n.forwarding}
                  </span>
                ) : n.voicemail ? (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 dark:bg-slate-800 dark:border-slate-700">
                    <Voicemail className="w-3.5 h-3.5" /> Send to Voicemail
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buy Number Modal - Desktop */}
      {buyModalOpen && (
        <div className="hidden lg:flex fixed inset-0 z-[60] items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setBuyModalOpen(false)} />
          <div className="relative bg-white rounded-[24px] shadow-2xl flex flex-col w-[600px] max-h-[80vh] dark:bg-slate-900">
            <div className="shrink-0 px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Get a New Number</h2>
              <button onClick={() => setBuyModalOpen(false)} className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors dark:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="shrink-0 p-5 bg-slate-50/50 flex flex-col gap-3 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
              <div className="relative w-full shadow-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Country, Area Code or Number..."
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-11 pr-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {countryFilters.map((cf, i) => (
                  <button
                    key={cf.label}
                    onClick={() => setActiveFilter(i)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                      activeFilter === i
                        ? 'bg-slate-800 text-white shadow-sm dark:bg-indigo-600'
                        : 'bg-white border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    )}
                  >
                    {cf.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-grow overflow-y-auto px-5 py-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Available Numbers in <span className="text-slate-800 dark:text-slate-100">United States</span></p>
              {availableNumbers.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => selectNumber(opt.id, opt.price)}
                  className={cn(
                    'relative p-4 border-2 rounded-2xl cursor-pointer flex items-center justify-between transition-all hover:scale-[1.01]',
                    selectedNumber === opt.id
                      ? 'border-indigo-600 bg-indigo-50/30'
                      : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-700 dark:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 text-[18px] flex items-center justify-center shrink-0 border border-slate-200 dark:bg-slate-700 dark:border-slate-600">
                      {opt.flag}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{opt.number}</h4>
                      <div className="flex gap-1 mt-1">
                        {opt.features.map((f) => (
                          <span key={f} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-700 dark:text-slate-300">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-sm font-extrabold text-indigo-600">${opt.price.toFixed(2)}<span className="text-[10px] text-slate-400">/mo</span></span>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      selectedNumber === opt.id ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 dark:border-slate-600'
                    )}>
                      {selectedNumber === opt.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="shrink-0 p-5 border-t border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-700">
              <button
                disabled={!selectedNumber}
                className={cn(
                  'w-full h-12 rounded-2xl text-sm font-extrabold flex items-center justify-center transition-all',
                  selectedNumber
                    ? 'bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                )}
              >
                {selectedNumber ? `Pay $${selectedPrice?.toFixed(2)}/mo` : 'Select a Number'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(PhoneNumbers);
