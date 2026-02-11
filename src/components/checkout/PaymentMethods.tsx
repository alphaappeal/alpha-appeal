import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutPayment, useCheckoutPromo, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { formatZAR } from '@/lib/currency';
import { CreditCard, DollarSign, Star, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentMethodOption {
  id: 'payfast' | 'cod' | 'loyalty_points';
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  disabledReason?: string;
}

export const PaymentMethods: React.FC = () => {
  const { paymentMethod, loyaltyPointsUsed, loyaltyPointsAvailable } = useCheckoutPayment();
  const { promoDiscount } = useCheckoutPromo();
  const { setPaymentMethod, setLoyaltyPointsUsed } = useCheckoutActions();
  const { toast } = useToast();

  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'payfast',
      name: 'PayFast',
      description: 'Secure online payment with credit card or EFT',
      icon: <CreditCard className="w-5 h-5" />,
      available: true
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: <DollarSign className="w-5 h-5" />,
      available: true
    },
    {
      id: 'loyalty_points',
      name: 'Loyalty Points',
      description: `Use your loyalty points (Available: ${loyaltyPointsAvailable})`,
      icon: <Star className="w-5 h-5" />,
      available: loyaltyPointsAvailable > 0,
      disabledReason: loyaltyPointsAvailable <= 0 ? 'No loyalty points available' : undefined
    }
  ];

  const handlePaymentMethodSelect = (method: PaymentMethodOption['id']) => {
    if (method === 'loyalty_points' && loyaltyPointsAvailable <= 0) {
      toast({
        title: "No Loyalty Points",
        description: "You don't have any loyalty points to use.",
        variant: "destructive",
      });
      return;
    }

    setPaymentMethod(method);
    
    // Auto-set loyalty points to maximum if selecting loyalty points
    if (method === 'loyalty_points') {
      setLoyaltyPointsUsed(loyaltyPointsAvailable);
    } else if (paymentMethod === 'loyalty_points') {
      // Clear loyalty points if switching away
      setLoyaltyPointsUsed(0);
    }

    toast({
      title: "Payment Method Updated",
      description: `Selected: ${paymentMethods.find(p => p.id === method)?.name}`,
    });
  };

  const handleLoyaltyPointsChange = (points: number) => {
    if (points > loyaltyPointsAvailable) {
      toast({
        title: "Insufficient Points",
        description: `You only have ${loyaltyPointsAvailable} loyalty points available.`,
        variant: "destructive",
      });
      return;
    }
    setLoyaltyPointsUsed(points);
  };

  const getLoyaltyPointsValue = () => {
    return loyaltyPointsUsed; // 1 point = R1
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
      
      {/* Payment Method Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => {
          const isSelected = paymentMethod === method.id;
          const isLoyaltyMethod = method.id === 'loyalty_points';
          
          return (
            <div
              key={method.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                  : method.available
                  ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => method.available && handlePaymentMethodSelect(method.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
              </div>
              
              {!method.available && method.disabledReason && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{method.disabledReason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Loyalty Points Configuration */}
      {paymentMethod === 'loyalty_points' && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900">Loyalty Points Configuration</h4>
            <div className="text-sm text-blue-700">
              Available: {loyaltyPointsAvailable} points
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Points to Use
              </label>
              <input
                type="number"
                min="0"
                max={loyaltyPointsAvailable}
                value={loyaltyPointsUsed}
                onChange={(e) => handleLoyaltyPointsChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => handleLoyaltyPointsChange(loyaltyPointsAvailable)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Use All Points
              </Button>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => handleLoyaltyPointsChange(0)}
                className="w-full text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                Clear Points
              </Button>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-white rounded border border-blue-200">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Points Value:</span>
              <span className="font-medium text-blue-900">
                {formatZAR(getLoyaltyPointsValue())}
              </span>
            </div>
            <div className="flex justify-between text-xs text-blue-600 mt-1">
              <span>Points Used:</span>
              <span>{loyaltyPointsUsed} / {loyaltyPointsAvailable}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Selected Method:</span>
            <span className="font-medium">
              {paymentMethods.find(p => p.id === paymentMethod)?.name || 'Not selected'}
            </span>
          </div>
          
          {paymentMethod === 'loyalty_points' && (
            <div className="flex justify-between text-blue-600">
              <span>Loyalty Points Applied:</span>
              <span>- {formatZAR(getLoyaltyPointsValue())}</span>
            </div>
          )}
          
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Promo Code Applied:</span>
              <span>- {formatZAR(promoDiscount)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
            <span>Final Amount:</span>
            <span>{formatZAR(getLoyaltyPointsValue() + promoDiscount)}</span>
          </div>
        </div>
        
        {paymentMethod === 'payfast' && (
          <div className="mt-3 text-xs text-gray-600">
            <p>• Secure payment processing through PayFast</p>
            <p>• Supports credit cards, EFT, and SnapScan</p>
            <p>• Payment will be processed after order confirmation</p>
          </div>
        )}
        
        {paymentMethod === 'cod' && (
          <div className="mt-3 text-xs text-gray-600">
            <p>• Pay in cash when your order is delivered</p>
            <p>• Valid ID required for verification</p>
            <p>• Available for most delivery addresses</p>
          </div>
        )}
      </div>
    </div>
  );
};