import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutPayment, useCheckoutPromo, useCheckoutCart, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { PaymentMethods } from './PaymentMethods';
import { formatZAR } from '@/lib/currency';
import { cn } from "@/lib/utils";

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
        title: "Secure Selection Required",
        description: "Please designate your preferred payment architecture to authorize the transaction.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const isValid = await validateOrder();

      if (!isValid) {
        toast({
          title: "Authorization Verification Failed",
          description: "Our security protocols identified a discrepancy. Please re-verify order configurations.",
          variant: "destructive",
        });
        return;
      }

      const orderId = await createOrder('current_user_id'); // Would get actual user ID

      toast({
        title: "Transaction Successful",
        description: `Reference #${orderId} has been successfully authenticated.`,
      });

      window.location.href = `/checkout/confirmation?order=${orderId}`;

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Authentication Fault",
        description: "The secure gateway encountered a disruption. Please re-initiate the request.",
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
          title: 'PayFast Secure Gateway',
          description: 'South Africa\'s premier encrypted payment processor',
          icon: 'shield_locked'
        };
      case 'cod':
        return {
          title: 'Direct Hand-over',
          description: 'Settle via cash or card upon secure delivery',
          icon: 'handshake'
        };
      case 'loyalty_points':
        return {
          title: 'Alpha Privilege Points',
          description: `Redeeming ${loyaltyPointsUsed} heritage points`,
          icon: 'stars'
        };
      default:
        return {
          title: 'Awaiting Selection',
          description: 'Please define your settlement framework',
          icon: 'lock'
        };
    }
  };

  const paymentDetails = getPaymentMethodDetails();

  return (
    <div className="space-y-12">
      {/* Header Area */}
      <div className="border-b border-white/5 pb-8">
        <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wider">Financial Authentication</h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Select your preferred settlement framework</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Payment Selection */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">payments</span>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Settlement Methods</h3>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <PaymentMethods />
          </div>
        </div>

        {/* Payment Details & Instructions */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">info</span>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Framework Specifications</h3>
          </div>

          <div className={cn(
            "p-8 rounded-2xl border transition-all duration-500 flex gap-6",
            paymentMethod
              ? "glass-panel border-primary/20 bg-primary/5 shadow-[0_0_30px_rgba(107,142,107,0.1)]"
              : "bg-white/5 border-white/10 opacity-50"
          )}>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
              paymentMethod ? "bg-primary text-white" : "bg-white/10 text-gray-500"
            )}>
              <span className="material-symbols-outlined">{paymentDetails.icon}</span>
            </div>
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider">{paymentDetails.title}</h4>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed font-medium">{paymentDetails.description}</p>

              {paymentMethod && (
                <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-[10px] text-primary uppercase tracking-widest font-bold">
                    <span className="material-symbols-outlined text-xs">verified_user</span>
                    Encrypted Protocol Active
                  </div>

                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold leading-relaxed">
                    {paymentMethod === 'payfast' && "Redirect to secure vaults will occur upon authorization."}
                    {paymentMethod === 'cod' && "Valid identification is required for delivery authentication."}
                    {paymentMethod === 'loyalty_points' && "Privilege point deduction is instantaneous and non-reversible."}
                  </div>
                </div>
              )}
            </div>
          </div>

          {!paymentMethod && (
            <div className="flex items-start gap-3 p-6 bg-white/5 rounded-2xl border border-white/5">
              <span className="material-symbols-outlined text-gray-500 text-sm">help</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold leading-relaxed">
                Choose a method on the left to view specific protocol requirements and instructions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row gap-8 items-center justify-between">
        <button
          onClick={() => window.location.href = '/checkout/shipping'}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Return to Logistics
        </button>

        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !paymentMethod}
          className="px-12 py-8 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-widest text-xs h-auto rounded-xl shadow-[0_0_30px_rgba(107,142,107,0.3)] transition-all relative overflow-hidden group min-w-[280px]"
        >
          {isProcessing ? (
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              Authenticating...
            </span>
          ) : (
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-3">
                Authorize Transaction
                <span className="material-symbols-outlined text-sm">lock</span>
              </span>
              <span className="text-[10px] opacity-60 mt-1 font-normal tracking-normal lowercase italic">Final Commitment • {formatZAR(total)}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};