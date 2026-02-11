import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';
import { useCheckoutCart, useCheckoutAddresses, useCheckoutPromo, useCheckoutPayment } from '@/lib/stores/checkoutStore';
import { formatZAR } from '@/lib/currency';
import { payfastService } from '@/lib/payfast';

interface PayFastButtonProps {
  orderId: string;
  userId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PayFastButton: React.FC<PayFastButtonProps> = ({
  orderId,
  userId,
  onSuccess,
  onError
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cartItems = useCheckoutCart();
  const { shippingAddress, billingAddress } = useCheckoutAddresses();
  const { promoDiscount } = useCheckoutPromo();
  const { loyaltyPointsUsed } = useCheckoutPayment();
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = 50; // Standard shipping
      const vat = (subtotal + shipping) * 0.15;
      const total = Math.max(0, subtotal + shipping + vat - promoDiscount - loyaltyPointsUsed);

      // Generate order description
      const itemDescription = cartItems.length === 1 
        ? cartItems[0].product.product_name
        : `${cartItems.length} items`;

      // Generate PayFast payment data
      const paymentData: any = {
        merchant_id: import.meta.env.VITE_PAYFAST_MERCHANT_ID,
        merchant_key: import.meta.env.VITE_PAYFAST_MERCHANT_KEY,
        return_url: `${window.location.origin}/checkout/success?order=${orderId}`,
        cancel_url: `${window.location.origin}/checkout/cancelled?order=${orderId}`,
        notify_url: `${import.meta.env.VITE_API_URL}/api/payfast/webhook`,
        amount: total.toFixed(2),
        item_name: `Alpha Appeal Order #${orderId}`,
        item_description: itemDescription,
        email_address: shippingAddress?.full_name || 'customer@example.com',
        m_payment_id: orderId,
        name_first: shippingAddress?.full_name.split(' ')[0] || 'Customer',
        name_last: shippingAddress?.full_name.split(' ').slice(1).join(' ') || '',
        custom_str1: orderId,
        custom_str2: userId,
        custom_str3: 'order'
      };

      // Generate MD5 signature
      const signature = generateSignature(paymentData);
      paymentData.signature = signature;

      // Create hidden form and submit
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = import.meta.env.VITE_PAYFAST_URL;

      // Add all fields as hidden inputs
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value || '';
        form.appendChild(input);
      });

      // Append form to body and submit
      document.body.appendChild(form);
      form.submit();

      // Remove form after submission
      document.body.removeChild(form);

      toast({
        title: "Redirecting to PayFast",
        description: "You will be redirected to complete your payment securely.",
      });

      onSuccess?.();
      
    } catch (error) {
      console.error('PayFast payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate signature for PayFast
  function generateSignature(data: any): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(data)
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&');
    
    // Add passphrase
    const stringToHash = `${sortedParams}&passphrase=${encodeURIComponent(import.meta.env.VITE_PAYFAST_PASSPHRASE)}`;
    
    // Generate MD5 hash
    const crypto = require('crypto') as any;
    return crypto.createHash('md5').update(stringToHash).digest('hex');
  }

  // Calculate total for display
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const vat = (subtotal + shipping) * 0.15;
  const total = Math.max(0, subtotal + shipping + vat - promoDiscount - loyaltyPointsUsed);

  return (
    <Button 
      onClick={handlePayment}
      disabled={isSubmitting}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing Payment...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Complete Payment • {formatZAR(total)}
        </>
      )}
    </Button>
  );
};