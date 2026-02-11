import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutPromo, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { Percent, X, CheckCircle, AlertCircle } from 'lucide-react';

export const PromoCodeInput: React.FC = () => {
  const { promoCode, promoCodeValid, promoDiscount } = useCheckoutPromo();
  const { setPromoCode, clearPromoCode } = useCheckoutActions();
  const { toast } = useToast();
  
  const [inputValue, setInputValue] = useState(promoCode || '');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPromo = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Invalid Promo Code",
        description: "Please enter a promo code.",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      await setPromoCode(inputValue.trim());
      setInputValue('');
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
      title: "Promo Code Removed",
      description: "The promo code has been removed from your order.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyPromo();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Promo Code</h3>
        {promoCodeValid && promoDiscount > 0 && (
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Applied: -{promoDiscount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Percent className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Enter promo code"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isApplying || promoCodeValid}
            className="pl-10"
          />
          {promoCodeValid && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
        
        {promoCodeValid ? (
          <Button
            variant="outline"
            onClick={handleRemovePromo}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Remove
          </Button>
        ) : (
          <Button
            onClick={handleApplyPromo}
            disabled={isApplying || !inputValue.trim()}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Applying...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        )}
      </div>

      {/* Promo Code Info */}
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Valid promo codes will be applied automatically</span>
        </div>
        <div>• Promo codes are case-sensitive</div>
        <div>• Only one promo code can be used per order</div>
        <div>• Promo codes cannot be combined with other offers</div>
      </div>

      {/* Applied Promo Code Display */}
      {promoCodeValid && promoCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Promo Code Applied</span>
            </div>
            <div className="text-sm text-green-700 font-medium">
              Savings: R {promoDiscount.toFixed(2)}
            </div>
          </div>
          <div className="mt-1 text-xs text-green-600">
            Code: <span className="font-mono font-semibold">{promoCode}</span>
          </div>
        </div>
      )}
    </div>
  );
};