import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutCart, useCheckoutAddresses, useCheckoutPayment, useCheckoutPromo } from '@/lib/stores/checkoutStore';
import { formatZAR } from '@/lib/currency';
import { CheckCircle, Truck, CreditCard, Star, MapPin, Calendar, Clock, Home } from 'lucide-react';

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
  const [isTrackingAvailable, setIsTrackingAvailable] = useState(false);

  useEffect(() => {
    // Generate order confirmation data
    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    
    setOrderData({
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
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
      trackingNumber: Math.random() > 0.5 ? `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined
    });

    // Simulate tracking becoming available
    setTimeout(() => {
      setIsTrackingAvailable(true);
    }, 2000);

    toast({
      title: "Order Confirmed!",
      description: "Your order has been successfully placed and is being processed.",
    });
  }, [toast]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const vat = (subtotal + shipping) * 0.15;
  const total = Math.max(0, subtotal + shipping + vat - promoDiscount - loyaltyPointsUsed);

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case 'payfast': return <CreditCard className="w-5 h-5" />;
      case 'cod': return <Truck className="w-5 h-5" />;
      case 'loyalty_points': return <Star className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'payfast': return 'PayFast';
      case 'cod': return 'Cash on Delivery';
      case 'loyalty_points': return 'Loyalty Points';
      default: return 'Payment Method';
    }
  };

  const handleTrackOrder = () => {
    if (orderData?.trackingNumber) {
      toast({
        title: "Tracking Information",
        description: `Your tracking number is: ${orderData.trackingNumber}`,
      });
    } else {
      toast({
        title: "Tracking Not Available",
        description: "Tracking information will be available once your order ships.",
        variant: "destructive",
      });
    }
  };

  const handleContinueShopping = () => {
    window.location.href = '/shop';
  };

  const handleViewOrderHistory = () => {
    window.location.href = '/profile';
  };

  if (!orderData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Order Confirmed!</h2>
        <p className="text-gray-600">Thank you for your purchase. Your order is being processed.</p>
      </div>

      {/* Order Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-mono font-medium">{orderData.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Date:</span>
              <span>{orderData.orderDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium text-green-600">{orderData.estimatedDelivery}</span>
            </div>
            {orderData.trackingNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tracking Number:</span>
                <span className="font-mono font-medium text-blue-600">{orderData.trackingNumber}</span>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-full">
                {getPaymentMethodIcon()}
              </div>
              <div>
                <div className="font-medium text-gray-900">Payment Method</div>
                <div className="text-sm text-gray-600">{getPaymentMethodName()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">Shipping Address</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{shippingAddress?.full_name}</div>
                <div>{shippingAddress?.street_address}</div>
                <div>{shippingAddress?.city}, {shippingAddress?.province} {shippingAddress?.postal_code}</div>
                <div>{shippingAddress?.country}</div>
                {shippingAddress?.phone && <div>Phone: {shippingAddress.phone}</div>}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Home className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">Billing Address</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{billingAddress?.full_name}</div>
                <div>{billingAddress?.street_address}</div>
                <div>{billingAddress?.city}, {billingAddress?.province} {billingAddress?.postal_code}</div>
                <div>{billingAddress?.country}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
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

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What Happens Next?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Processing</h4>
              <p className="text-sm text-blue-700">We're preparing your order for shipment</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Shipping</h4>
              <p className="text-sm text-blue-700">Your order will ship within 1-2 business days</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Delivery</h4>
              <p className="text-sm text-blue-700">Expected delivery by {orderData.estimatedDelivery}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={handleTrackOrder}
          disabled={!isTrackingAvailable}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isTrackingAvailable ? (
            <>
              Track Order
              <Truck className="w-4 h-4 ml-2" />
            </>
          ) : (
            'Track Order (Coming Soon)'
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleViewOrderHistory}
          className="text-gray-600 hover:text-gray-900"
        >
          View Order History
        </Button>
        
        <Button
          onClick={handleContinueShopping}
          className="bg-green-600 hover:bg-green-700"
        >
          Continue Shopping
        </Button>
      </div>

      {/* Customer Support */}
      <div className="text-center text-sm text-gray-600">
        <p>Questions about your order? Contact our customer support at</p>
        <p className="font-medium">support@alphaappeal.co.za</p>
        <p className="mt-1">We're here to help 24/7</p>
      </div>
    </div>
  );
};