import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutPromo, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { cn } from "@/lib/utils";

export const PromoCodeInput: React.FC = () => {
  const { promoCode, promoCodeValid, promoDiscount } = useCheckoutPromo();
  const { setPromoCode, clearPromoCode } = useCheckoutActions();
  const { toast } = useToast();

  const [inputValue, setInputValue] = useState(promoCode || '');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPromo = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Input Required",
        description: "Please define an invitation or promotion certificate identifier.",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      await setPromoCode(inputValue.trim());
      setInputValue('');
      toast({
        title: "Certificate Authenticated",
        description: "Your promotion identifier has been successfully validated.",
      });
    } catch (error) {
      console.error('Error applying promo code:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemovePromo = () => {
    clearPromoCode();
    setInputValue('');
    toast({
      title: "Certificate Deactivated",
      description: "The promotion identifier has been removed from your current order framework.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyPromo();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Privilege Certificates</label>
        {promoCodeValid && promoDiscount > 0 && (
          <div className="flex items-center gap-2 text-primary animate-in fade-in duration-500">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Authenticated</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-gray-500">
            <span className="material-symbols-outlined text-sm">confirmation_number</span>
          </div>
          <Input
            type="text"
            placeholder="Promotion Identifier"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isApplying || promoCodeValid}
            className="pl-12 bg-white/5 border-white/5 rounded-xl text-white font-bold h-12 focus-visible:ring-1 focus-visible:ring-primary/30 transition-all placeholder:text-gray-700"
          />
          {promoCodeValid && (
            <div className="absolute inset-y-0 right-4 flex items-center">
              <span className="material-symbols-outlined text-primary text-sm animate-in zoom-in">check_circle</span>
            </div>
          )}
        </div>

        {promoCodeValid ? (
          <Button
            variant="outline"
            onClick={handleRemovePromo}
            className="h-12 border-white/5 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] px-6"
          >
            Deactivate
          </Button>
        ) : (
          <Button
            onClick={handleApplyPromo}
            disabled={isApplying || !inputValue.trim()}
            className="h-12 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] px-8 shadow-[0_0_15px_rgba(107,142,107,0.2)]"
          >
            {isApplying ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              'Authenticate'
            )}
          </Button>
        )}
      </div>

      {/* Applied Promo Code Details */}
      {promoCodeValid && promoCode && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">sell</span>
            </div>
            <div>
              <p className="text-white text-[10px] font-bold uppercase tracking-widest">Active Certificate</p>
              <p className="text-gray-500 text-[10px] font-mono mt-1 font-bold">{promoCode}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary text-sm font-bold">-{promoDiscount.toFixed(2)} Value</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mt-1">Order Modification</p>
          </div>
        </div>
      )}

      {/* Specification Details */}
      {!promoCodeValid && (
        <div className="flex gap-3 px-1">
          <span className="material-symbols-outlined text-gray-700 text-[14px]">info</span>
          <p className="text-[9px] text-gray-600 uppercase tracking-[0.1em] font-medium leading-relaxed">
            Certificates are case-sensitive and restricted to singular use per transaction framework. Combination with exclusive loyalty tiers may be restricted.
          </p>
        </div>
      )}
    </div>
  );
};