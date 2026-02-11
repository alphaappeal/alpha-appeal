import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutPayment, useCheckoutPromo, useCheckoutCart, useCheckoutAddresses, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { PaymentMethods } from './PaymentMethods';
import { PayFastButton } from './PayFastButton';
import { formatZAR } from '@/lib/currency';
import { CreditCard, Truck, Percent, Star, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export const CheckoutStep3: React.FC = () => {
  const { paymentMethod, loyaltyPointsUsed } = useCheckoutPayment();
  const { promoDiscount } = useCheckoutPromo();
  const cartItems = useCheckoutCart();
  const { createOrder, validateOrder } = useCheckoutActions();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const vat = (subtotal + shipping) * 0.15;
  const total = Math.max(0, subtotal + shipping + vat - promoDiscount - loyaltyPointsUsed);

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      toast({
        title: "No Payment Method",
        description: "Please select a payment method before placing your order.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Validate order first
      const isValid = await validateOrder();
      
      if (!isValid) {
        toast({
          title: "Order Validation Failed",
          description: "Please check your order details and try again.",
          variant: "destructive",
        });
        return;
      }

      // Create order
      const orderId = await createOrder('current_user_id'); // Would get actual user ID
      
      toast({
        title: "Order Created Successfully",
        description: `Your order #${orderId} has been created.`,
      });

      // Navigate to confirmation
      window.location.href = `/checkout/confirmation?order=${orderId}`;
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodDetails = () => {
    switch (paymentMethod) {
      case 'payfast':
        return {
          title: 'PayFast Payment',
          description: 'Secure online payment processing',
          icon: <CreditCard className="w-5 h-5" />
        };
      case 'cod':
        return {
          title: 'Cash on Delivery',
          description: 'Pay when your order is delivered',
          icon: <Truck className="w-5 h-5" />
        };
      case 'loyalty_points':
        return {
          title: 'Loyalty Points Payment',
          description: `Using ${loyaltyPointsUsed} loyalty points`,
          icon: <Star className="w-5 h-5" />
        };
      default:
        return {
          title: 'Select Payment Method',
          description: 'Choose how you want to pay',
          icon: <AlertCircle className="w-5 h-5" />
        };
    }
  };

  const paymentDetails = getPaymentMethodDetails();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
        <p className="text-gray-600 mt-1">Choose how you want to pay for your order.</p>
      </div>

      {/* Payment Methods Selection */}
      <div className="space-y-6">
        <PaymentMethods />
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatZAR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{formatZAR(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">VAT (15%)</span>
            <span>{formatZAR(vat)}</span>
          </div>
          
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Promo Code Applied</span>
              <span>- {formatZAR(promoDiscount)}</span>
            </div>
          )}
          
          {loyaltyPointsUsed > 0 && (
            <div className="flex justify-between text-blue-600 font-medium">
              <span>Loyalty Points Used</span>
              <span>- {formatZAR(loyaltyPointsUsed)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatZAR(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Summary */}
      {paymentMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              {paymentDetails.icon}
            </div>
            <div>
              <h4 className="font-medium text-blue-900">{paymentDetails.title}</h4>
              <p className="text-sm text-blue-700">{paymentDetails.description}</p>
            </div>
            <div className="ml-auto">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Payment Instructions */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-2">Payment Instructions</h4>
        
        {paymentMethod === 'payfast' && (
          <div className="text-sm text-gray-600 space-y-2">
            <p>• You will be redirected to PayFast for secure payment processing</p>
            <p>• Supported payment methods: Credit Card, EFT, SnapScan</p>
            <p>• Your order will be confirmed once payment is successful</p>
            <p>• You will receive a confirmation email with order details</p>
          </div>
        )}
        
        {paymentMethod === 'cod' && (
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Pay in cash when your order is delivered</p>
            <p>• Valid ID required for verification</p>
            <p>• Delivery available Monday-Saturday, 9 AM - 6 PM</p>
            <p>• Please ensure someone is available to receive the order</p>
          </div>
        )}
        
        {paymentMethod === 'loyalty_points' && (
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Loyalty points will be deducted from your account</p>
            <p>• Points are non-refundable once used</p>
            <p>• Order will be processed immediately</p>
            <p>• You will receive a confirmation email</p>
          </div>
        )}
        
        {!paymentMethod && (
          <div className="text-sm text-gray-600">
            Please select a payment method to proceed with your order.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/checkout/shipping'}
        >
          Back to Shipping
        </Button>
        
        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !paymentMethod}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            `Place Order • ${formatZAR(total)}`
          )}
        </Button>
      </div>
    </div>
  );
};