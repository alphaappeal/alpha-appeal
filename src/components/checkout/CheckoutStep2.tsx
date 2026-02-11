import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutAddresses, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { AddressForm } from './AddressForm';
import { AddressSelector } from './AddressSelector';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from "@/lib/utils";

export const CheckoutStep2: React.FC = () => {
  const { shippingAddress, billingAddress, savedAddresses } = useCheckoutAddresses();
  const { setShippingAddress, setBillingAddress } = useCheckoutActions();
  const { toast } = useToast();

  const [useSameAsShipping, setUseSameAsShipping] = React.useState(false);

  const handleUseSameAddress = () => {
    if (shippingAddress) {
      setBillingAddress(shippingAddress);
      setUseSameAsShipping(true);
      toast({
        title: "Configuration Synchronized",
        description: "Billing address has been set to match your shipping destination.",
      });
    }
  };

  const handleUseDifferentBilling = () => {
    setUseSameAsShipping(false);
    setBillingAddress(null);
  };

  const handleContinue = () => {
    if (!shippingAddress || !billingAddress) {
      toast({
        title: "Incomplete Details",
        description: "Please provide both shipping and billing addresses to proceed.",
        variant: "destructive",
      });
      return;
    }

    window.location.href = '/checkout/payment';
  };

  return (
    <div className="space-y-12">
      {/* Header Area */}
      <div className="border-b border-white/5 pb-8">
        <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wider">Logistics & Billing</h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Specify your delivery coordinates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Shipping Address */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Shipping Destination</h3>
          </div>

          <AddressSelector
            type="shipping"
            selectedAddress={shippingAddress}
            savedAddresses={savedAddresses.filter(addr => addr.address_type === 'shipping')}
            onSelectAddress={setShippingAddress}
            onAddNewAddress={() => setShippingAddress(null)}
            onEditAddress={(address) => setShippingAddress(address)}
            onDeleteAddress={(addressId) => {
              console.log('Delete shipping address:', addressId);
            }}
          />

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <AddressForm
              type="shipping"
              value={shippingAddress}
              onChange={setShippingAddress}
              savedAddresses={savedAddresses.filter(addr => addr.address_type === 'shipping')}
            />
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">receipt</span>
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Billing Details</h3>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Checkbox
                id="sameAsShipping"
                checked={useSameAsShipping}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleUseSameAddress();
                  } else {
                    handleUseDifferentBilling();
                  }
                }}
                className="border-primary data-[state=checked]:bg-primary"
              />
              <Label htmlFor="sameAsShipping" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 cursor-pointer">
                Mirror Shipping
              </Label>
            </div>
          </div>

          {useSameAsShipping && shippingAddress && (
            <div className="p-6 glass-panel border border-primary/20 rounded-2xl bg-primary/5 flex gap-4 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">Synchronized with Shipping</h4>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                  {shippingAddress.full_name}<br />
                  {shippingAddress.street_address}, {shippingAddress.city}<br />
                  {shippingAddress.province}, {shippingAddress.postal_code}
                </p>
              </div>
            </div>
          )}

          {!useSameAsShipping && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 animate-in fade-in slide-in-from-top-2">
              <AddressForm
                type="billing"
                value={billingAddress}
                onChange={setBillingAddress}
                savedAddresses={savedAddresses.filter(addr => addr.address_type === 'billing')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row gap-8 items-center justify-between">
        <button
          onClick={() => window.location.href = '/checkout/review'}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Inventory Review
        </button>

        <Button
          onClick={handleContinue}
          disabled={!shippingAddress || !billingAddress}
          className="px-10 py-6 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-widest text-xs h-auto rounded-xl shadow-[0_0_20px_rgba(107,142,107,0.3)] transition-all"
        >
          <span className="flex items-center gap-3">
            Payment Selection
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </Button>
      </div>
    </div>
  );
};
