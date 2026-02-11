import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutAddresses, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { AddressForm } from './AddressForm';
import { AddressSelector } from './AddressSelector';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy, MapPin } from 'lucide-react';

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
        title: "Billing Address Updated",
        description: "Billing address set to match shipping address.",
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
        title: "Missing Information",
        description: "Please provide both shipping and billing addresses.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to payment step
    window.location.href = '/checkout/payment';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
        <p className="text-gray-600 mt-1">Please provide your shipping and billing addresses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
          
          {/* Address Selector for Shipping */}
          <AddressSelector
            type="shipping"
            selectedAddress={shippingAddress}
            savedAddresses={savedAddresses.filter(addr => addr.address_type === 'shipping')}
            onSelectAddress={setShippingAddress}
            onAddNewAddress={() => setShippingAddress(null)}
            onEditAddress={(address) => setShippingAddress(address)}
            onDeleteAddress={(addressId) => {
              // TODO: Implement delete functionality
              console.log('Delete shipping address:', addressId);
            }}
          />
          
          {/* Address Form for Shipping */}
          <AddressForm
            type="shipping"
            value={shippingAddress}
            onChange={setShippingAddress}
            savedAddresses={savedAddresses.filter(addr => addr.address_type === 'shipping')}
          />
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
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
                />
                <Label htmlFor="sameAsShipping" className="text-sm font-medium">
                  Same as shipping
                </Label>
              </div>
              <Button
                variant="outline"
                onClick={handleUseSameAddress}
                disabled={!shippingAddress || useSameAsShipping}
                className="text-sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy from Shipping
              </Button>
            </div>
          </div>
          
          {/* Show billing address preview if using same as shipping */}
          {useSameAsShipping && shippingAddress && (
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Using Shipping Address</h4>
                  <p className="text-sm text-blue-700">
                    {shippingAddress.full_name}<br />
                    {shippingAddress.street_address}, {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Address Form for Billing (only show if not using same as shipping) */}
          {!useSameAsShipping && (
            <AddressForm
              type="billing"
              value={billingAddress}
              onChange={setBillingAddress}
              savedAddresses={savedAddresses.filter(addr => addr.address_type === 'billing')}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/checkout/review'}
        >
          Back to Review
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={!shippingAddress || !billingAddress}
          className="bg-green-600 hover:bg-green-700"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
};
