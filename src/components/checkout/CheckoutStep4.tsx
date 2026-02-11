import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutCart, useCheckoutAddresses, useCheckoutPayment, useCheckoutPromo } from '@/lib/stores/checkoutStore';
import { formatZAR } from '@/lib/currency';
import { cn } from "@/lib/utils";

interface OrderConfirmationData {
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

export const CheckoutStep4: React.FC = () => {
  const cartItems = useCheckoutCart();
  const { shippingAddress, billingAddress } = useCheckoutAddresses();
  const { paymentMethod, loyaltyPointsUsed } = useCheckoutPayment();
  const { promoDiscount } = useCheckoutPromo();
  const { toast } = useToast();

  const [orderData, setOrderData] = useState<OrderConfirmationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simulate final authentication delay
    const timer = setTimeout(() => {
      const now = new Date();
      const estimatedDelivery = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      setOrderData({
        orderId: `AA-${Date.now().toString().slice(-6)}`,
        orderDate: now.toLocaleDateString('en-ZA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        estimatedDelivery: estimatedDelivery.toLocaleDateString('en-ZA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        trackingNumber: `AA-TRK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      });
      setIsProcessing(false);

      toast({
        title: "Transaction Authenticated",
        description: "Your order has been successfully integrated into our processing architecture.",
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const vat = (subtotal + shipping) * 0.15;
  const total = Math.max(0, subtotal + shipping + vat - promoDiscount - loyaltyPointsUsed);

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'payfast': return 'Secure Gateway';
      case 'cod': return 'Direct Exchange';
      case 'loyalty_points': return 'Privilege Points';
      default: return 'Authenticated Framework';
    }
  };

  const handleTrackOrder = () => {
    toast({
      title: "Encrypted Dispatch Data",
      description: `Your unique tracking identifier is: ${orderData?.trackingNumber}`,
    });
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-pulse">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        </div>
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white uppercase tracking-widest">Finalizing Authentication</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-2">Integrating order data with secure vaults...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Success Header */}
      <div className="text-center space-y-6 pb-12 border-b border-white/5">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20 shadow-[0_0_50px_rgba(107,142,107,0.2)]">
          <span className="material-symbols-outlined text-primary text-5xl">verified</span>
        </div>
        <div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter">Order Authenticated</h2>
          <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            Gratitude for your patronage. Your curated selection has been successfully reserved and is now entering our logistics pipeline.
          </p>
        </div>
      </div>

      {/* Primary Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Details */}
        <div className="glass-panel border-white/5 rounded-2xl p-8 space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">Verification Summary</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Reference Number</span>
              <span className="text-white font-mono font-bold tracking-widest">{orderData?.orderId}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Authenticated On</p>
                <p className="text-white text-xs font-bold leading-tight">{orderData?.orderDate}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Expected Delivery</p>
                <p className="text-primary text-xs font-bold leading-tight">{orderData?.estimatedDelivery}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-sm text-gray-400">payments</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Framework</p>
                <p className="text-white text-xs font-bold uppercase">{getPaymentMethodName()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Information */}
        <div className="glass-panel border-white/5 rounded-2xl p-8 space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">Logistics Coordinates</h3>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                <span className="material-symbols-outlined text-[14px] text-gray-500">local_shipping</span>
              </div>
              <div className="text-xs text-gray-400 font-medium leading-relaxed">
                <p className="text-white uppercase font-bold tracking-widest mb-2 text-[10px]">Shipping Destination</p>
                <p className="text-white">{shippingAddress?.full_name}</p>
                <p>{shippingAddress?.street_address}</p>
                <p>{shippingAddress?.city}, {shippingAddress?.province} {shippingAddress?.postal_code}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                <span className="material-symbols-outlined text-[14px] text-gray-500">description</span>
              </div>
              <div className="text-xs text-gray-400 font-medium leading-relaxed">
                <p className="text-white uppercase font-bold tracking-widest mb-2 text-[10px]">Billing Specification</p>
                <p className="text-white">{billingAddress?.full_name}</p>
                <p>{billingAddress?.street_address}</p>
                <p>{billingAddress?.city}, {billingAddress?.province} {billingAddress?.postal_code}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Phase Pipeline */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 space-y-8">
        <h3 className="text-white text-xs font-bold uppercase tracking-widest text-center">Post-Authentication Pipeline</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[1.25rem] left-[15%] right-[15%] h-[1px] bg-primary/20 -z-1" />

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 z-10">
              <span className="material-symbols-outlined text-primary text-sm">precision_manufacturing</span>
            </div>
            <div>
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">Curation Phase</h4>
              <p className="text-gray-500 text-[9px] uppercase tracking-widest leading-tight">Order assembly and quality audit</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 z-10">
              <span className="material-symbols-outlined text-primary text-sm">move_to_inbox</span>
            </div>
            <div>
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">Dispatch Initiation</h4>
              <p className="text-gray-500 text-[9px] uppercase tracking-widest leading-tight">Secure transfer to logistics network</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 z-10">
              <span className="material-symbols-outlined text-primary text-sm">done_all</span>
            </div>
            <div>
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">Final Hand-over</h4>
              <p className="text-gray-500 text-[9px] uppercase tracking-widest leading-tight">Secured arrival at destination</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col items-center gap-6 pt-6">
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl">
          <Button
            onClick={handleTrackOrder}
            className="flex-1 min-w-[200px] py-6 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-widest text-xs h-auto rounded-xl shadow-[0_0_20px_rgba(107,142,107,0.3)] transition-all"
          >
            Track Dispatch Data
            <span className="material-symbols-outlined text-sm ml-2">query_stats</span>
          </Button>

          <button
            onClick={() => window.location.href = '/shop'}
            className="flex-1 min-w-[200px] py-6 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white border border-white/5 hover:border-white/20 rounded-xl transition-all"
          >
            Continue Browsing
          </button>
        </div>

        <div className="text-center">
          <p className="text-[9px] text-gray-600 uppercase tracking-[0.2em] font-bold">Alpha Experience Protocol v2.5</p>
          <p className="text-gray-500 text-[10px] mt-2 italic font-medium">Support: concierge@alphaappeal.co.za</p>
        </div>
      </div>
    </div>
  );
};