import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Phone,
  MessageSquare,
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
  Trash2,
  ArrowRight,
  Hash,
  X
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

const mockInventory = [
  { id: 'num_1', number: '+1 (212) 555-0198', location: 'United States', country: '🇺🇸', type: 'Local', capabilities: ['voice', 'sms'], price: 2.50, setupFee: 1.00 },
  { id: 'num_2', number: '+44 20 7946 0123', location: 'United Kingdom', country: '🇬🇧', type: 'Local', capabilities: ['voice', 'sms'], price: 4.00, setupFee: 1.00 },
  { id: 'num_3', number: '+1 (888) 234-5678', location: 'Canada (Toll-Free)', country: '🇨🇦', type: 'Toll-Free', capabilities: ['voice'], price: 1.50, setupFee: 1.00 },
  { id: 'num_4', number: '+61 2 9066 1234', location: 'Australia', country: '🇦🇺', type: 'Local', capabilities: ['voice'], price: 2.50, setupFee: 1.00 },
  { id: 'num_5', number: '+49 30 1234567', location: 'Germany', country: '🇩🇪', type: 'Local', capabilities: ['voice', 'sms'], price: 2.00, setupFee: 1.00 },
  { id: 'num_6', number: '+81 3 1234 5678', location: 'Japan', country: '🇯🇵', type: 'Local', capabilities: ['voice'], price: 3.50, setupFee: 1.00 },
];

export default function BuyNumber() {
  const navigate = useNavigate();
  const [selectedNumbers, setSelectedNumbers] = useState<Set<string>>(new Set());
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedNumbers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedItems = mockInventory.filter(n => selectedNumbers.has(n.id));
  const selectedCount = selectedItems.length;
  const monthlyTotal = selectedItems.reduce((acc, curr) => acc + curr.price, 0);
  const setupTotal = selectedItems.reduce((acc, curr) => acc + curr.setupFee, 0);

  return (
    <div className="flex-1 w-full p-2 md:p-4 pb-4 flex flex-col gap-3 md:gap-4 relative">
      {/* Sticky Header & Filter Section */}
      <div className="sticky top-0 z-30 flex flex-col gap-3 -mx-2 md:-mx-4 px-2 md:px-4 pt-2 md:pt-4 pb-2 bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50">
        {/* Header */}
        <div className="shrink-0 flex flex-row items-center md:items-end justify-between gap-3">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="mb-1.5 flex items-center gap-1 text-[10px] md:text-xs font-semibold text-primary hover:underline"
            >
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 rotate-180" />
              Back to Numbers
            </button>
            <div className="hidden md:block">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Buy Virtual Numbers</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Search our global inventory of voice and SMS capable numbers.</p>
            </div>
          </div>
          
          {/* Cart Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">View Cart</span>
            {selectedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 md:static md:-top-auto md:-right-auto bg-white text-primary h-4 w-4 md:h-5 md:w-5 md:px-1.5 md:py-0.5 rounded-full md:rounded-md text-[10px] font-bold flex items-center justify-center">
                {selectedCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-card rounded-xl p-2.5 md:p-3 flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2.5 shrink-0 border border-border/50 shadow-sm">
          <div className="flex-1 min-w-[150px]">
            <div className="relative">
              <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="w-full pl-8 h-8 text-xs bg-background rounded-lg" placeholder="Country or area code (e.g. US, 212)" />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <select className="flex h-8 w-full md:w-auto min-w-[120px] rounded-lg border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
              <option>All Types</option>
              <option>Local</option>
              <option>Toll-Free</option>
              <option>Mobile</option>
            </select>
          </div>
          <div className="flex gap-1.5">
            <button className="px-2.5 py-1.5 border border-primary bg-primary/10 text-primary rounded-lg text-[10px] font-semibold transition-all">Voice</button>
            <button className="px-2.5 py-1.5 border border-border bg-background hover:border-primary transition-all rounded-lg text-[10px] font-medium">SMS</button>
            <button className="px-2.5 py-1.5 border border-border bg-background hover:border-primary transition-all rounded-lg text-[10px] font-medium">MMS</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-4 w-full flex-1 min-h-0">
        <div className="flex-1 w-full flex flex-col min-h-0 gap-3">
          {/* Inventory List (Compact & Scalable) */}
          <div className="flex flex-col gap-2 pb-2.5 lg:pb-0">
            {mockInventory.map((item) => {
              const isSelected = selectedNumbers.has(item.id);
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "glass-card rounded-xl p-2.5 md:p-3 transition-all border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
                    isSelected ? "border-primary shadow-md bg-primary/5" : "border-transparent hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-8 h-6 bg-muted rounded flex items-center justify-center text-sm shrink-0 border border-border/50">
                      {item.country}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm md:text-base text-foreground tracking-tight truncate">{item.number}</span>
                        <span className="bg-muted px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">{item.type}</span>
                      </div>
                      <span className="text-[10px] md:text-xs text-muted-foreground truncate">{item.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-11 sm:pl-0 shrink-0">
                    <div className="flex gap-1">
                      {item.capabilities.includes('voice') && (
                        <div className="flex items-center justify-center h-6 w-6 rounded bg-green-500/10 text-green-700" title="Voice">
                          <Phone className="h-3 w-3" />
                        </div>
                      )}
                      {item.capabilities.includes('sms') && (
                        <div className="flex items-center justify-center h-6 w-6 rounded bg-primary/10 text-primary" title="SMS">
                          <MessageSquare className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right flex flex-col items-end min-w-[60px]">
                      <span className="font-bold text-sm text-foreground">${item.price.toFixed(2)}<span className="text-[9px] font-normal text-muted-foreground">/mo</span></span>
                      {item.setupFee > 0 && <span className="text-[9px] text-muted-foreground">+${item.setupFee.toFixed(2)} setup</span>}
                    </div>

                    <button 
                      onClick={() => toggleSelection(item.id)}
                      className={cn(
                        "h-8 px-3 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-[11px]",
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      {isSelected ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Selected</span></>
                      ) : (
                        <><ShoppingCart className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Add</span></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Slideout Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCartOpen(false)} 
          />
          <div className="relative w-full max-w-[320px] h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Your Cart</h2>
                {selectedCount > 0 && (
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {selectedCount}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
              {selectedCount === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 opacity-50">
                  <Hash className="h-10 w-10 mb-3" />
                  <p className="text-sm font-medium">Cart is empty.<br/>Start adding numbers.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="bg-card p-3 rounded-xl border border-border/50 shadow-sm flex justify-between items-center">
                      <div className="min-w-0 pr-3">
                        <div className="text-sm font-bold text-foreground truncate">{item.number}</div>
                        <div className="text-[10px] text-muted-foreground">${item.price.toFixed(2)}/mo • {item.location}</div>
                      </div>
                      <button onClick={() => toggleSelection(item.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1.5 rounded-lg hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 border-t border-border/50 bg-card/50">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground text-xs font-medium">One-time Setup</span>
                <span className="font-semibold text-foreground text-xs">${setupTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 items-center">
                <span className="text-muted-foreground text-sm font-medium">Monthly Total</span>
                <span className="font-bold text-primary text-2xl">${monthlyTotal.toFixed(2)}</span>
              </div>
              
              <button 
                disabled={selectedCount === 0}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-md shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none text-sm"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-[10px] text-muted-foreground text-center mt-3 leading-tight">
                Pricing excludes local taxes and regulatory fees.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
