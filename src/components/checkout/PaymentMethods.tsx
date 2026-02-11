import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutPayment, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { formatZAR } from '@/lib/currency';
import { cn } from "@/lib/utils";

interface PaymentMethodOption {
  id: 'payfast' | 'cod' | 'loyalty_points';
  name: string;
  description: string;
  icon: string;
  available: boolean;
  disabledReason?: string;
}

export const PaymentMethods: React.FC = () => {
  const { paymentMethod, loyaltyPointsUsed, loyaltyPointsAvailable } = useCheckoutPayment();
  const { setPaymentMethod, setLoyaltyPointsUsed } = useCheckoutActions();
  const { toast } = useToast();

  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'payfast',
      name: 'Secure Portal',
      description: 'Encrypted online transaction via PayFast',
      icon: 'account_balance',
      available: true
    },
    {
      id: 'cod',
      name: 'Direct Exchange',
      description: 'Settle via cash or card upon delivery',
      icon: 'local_mall',
      available: true
    },
    {
      id: 'loyalty_points',
      name: 'Privilege Balance',
      description: `Heritage points available: ${loyaltyPointsAvailable}`,
      icon: 'stars',
      available: loyaltyPointsAvailable > 0,
      disabledReason: loyaltyPointsAvailable <= 0 ? 'Insufficient privilege balance' : undefined
    }
  ];

  const handlePaymentMethodSelect = (method: PaymentMethodOption['id']) => {
    if (method === 'loyalty_points' && loyaltyPointsAvailable <= 0) {
      toast({
        title: "Balance Insufficient",
        description: "Your Alpha Privilege balance currently stands at zero.",
        variant: "destructive",
      });
      return;
    }

    setPaymentMethod(method);

    if (method === 'loyalty_points') {
      setLoyaltyPointsUsed(loyaltyPointsAvailable);
    } else if (paymentMethod === 'loyalty_points') {
      setLoyaltyPointsUsed(0);
    }

    toast({
      title: "Framework Updated",
      description: `Settlement method switched to ${paymentMethods.find(p => p.id === method)?.name}.`,
    });
  };

  const handleLoyaltyPointsChange = (points: number) => {
    if (points > loyaltyPointsAvailable) {
      toast({
        title: "Authorization Error",
        description: `Request exceeds your current balance of ${loyaltyPointsAvailable} points.`,
        variant: "destructive",
      });
      return;
    }
    setLoyaltyPointsUsed(points);
  };

  return (
    <div className="space-y-10">
      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 gap-4">
        {paymentMethods.map((method) => {
          const isSelected = paymentMethod === method.id;

          return (
            <div
              key={method.id}
              className={cn(
                "p-6 rounded-2xl cursor-pointer transition-all duration-500 border relative group overflow-hidden",
                isSelected
                  ? "bg-primary/10 border-primary/40 shadow-[0_0_25px_rgba(107,142,107,0.15)]"
                  : method.available
                    ? "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                    : "bg-white/5 border-white/5 opacity-40 cursor-not-allowed grayscale"
              )}
              onClick={() => method.available && handlePaymentMethodSelect(method.id)}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border",
                    isSelected
                      ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(107,142,107,0.4)]"
                      : "bg-white/5 border-white/10 text-gray-400 group-hover:border-primary/30 group-hover:text-primary/70"
                  )}>
                    <span className="material-symbols-outlined text-2xl">{method.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm">{method.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "w-6 h-6 rounded-full border items-center justify-center flex transition-all duration-500",
                  isSelected ? "bg-primary border-primary text-white scale-110" : "bg-transparent border-white/10"
                )}>
                  {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                </div>
              </div>

              {!method.available && method.disabledReason && (
                <div className="mt-4 flex items-center gap-2 text-red-500">
                  <span className="material-symbols-outlined text-xs">lock_clock</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold">{method.disabledReason}</span>
                </div>
              )}

              {/* Decorative accent for selected */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Privilege Configuration */}
      {paymentMethod === 'loyalty_points' && (
        <div className="p-8 glass-panel border border-primary/20 rounded-2xl bg-primary/5 animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Balance Allocation</h4>
            </div>
            <div className="text-[10px] text-primary uppercase tracking-widest font-bold">
              {loyaltyPointsAvailable} Points available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">
                Points to Allocate
              </label>
              <input
                type="number"
                min="0"
                max={loyaltyPointsAvailable}
                value={loyaltyPointsUsed}
                onChange={(e) => handleLoyaltyPointsChange(parseInt(e.target.value) || 0)}
                className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={() => handleLoyaltyPointsChange(loyaltyPointsAvailable)}
                className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-white bg-white/10 hover:bg-primary rounded-xl transition-all"
              >
                Max Impact
              </button>
              <button
                onClick={() => handleLoyaltyPointsChange(0)}
                className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-white/5 hover:border-red-500/30 hover:text-red-400 rounded-xl transition-all"
              >
                Reset
              </button>
            </div>

            <div className="flex items-end lg:col-span-1 border-l border-white/5 pl-6 md:hidden lg:flex">
              <div className="w-full">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Liquidity Value</p>
                <p className="text-2xl font-bold text-primary">{formatZAR(loyaltyPointsUsed)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};