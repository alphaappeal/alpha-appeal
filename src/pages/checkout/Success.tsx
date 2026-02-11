import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, ShoppingCart, Mail, Clock, Truck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { formatZAR } from '@/lib/currency';
import { supabase } from '@/lib/supabase/client';

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: any;
  billing_address: any;
  items: Array<{
    id: string;
    product: {
      product_name: string;
      product_images: Array<{ image_url: string; alt_text: string }>;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order');

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      
      // Fetch order details
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              product_name,
              product_images
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Order not found');

      setOrder(data);
    } catch (err) {
      console.error('Error loading order:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedDelivery = () => {
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    return deliveryDate.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <Button onClick={() => window.location.href = '/shop'} className="w-full">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
          <div className="space-y-4">
            <Button onClick={() => window.location.href = '/shop'} className="w-full">
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/account/orders'} className="w-full">
              View Order History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase! We've sent a confirmation email to your registered email address.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>
                  Order #{order.order_number} • {new Date(order.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Order Total</h4>
                    <p className="text-2xl font-bold text-gray-900">{formatZAR(order.total_amount)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Delivery Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Shipping Address</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        {order.shipping_address?.full_name}<br />
                        {order.shipping_address?.street_address}<br />
                        {order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.postal_code}<br />
                        {order.shipping_address?.country}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">Estimated Delivery</span>
                      </div>
                      <p className="text-sm text-green-700">{getEstimatedDelivery()}</p>
                      <p className="text-xs text-green-600 mt-1">Monday - Saturday, 9 AM - 6 PM</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Items in Your Order</h4>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.product_images && item.product.product_images.length > 0 ? (
                            <img
                              src={item.product.product_images[0].image_url}
                              alt={item.product.product_images[0].alt_text || item.product.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.product.product_name}</h5>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatZAR(item.total_price)}</p>
                          <p className="text-xs text-gray-500">Unit: {formatZAR(item.unit_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>What happens next</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Order Processing</h4>
                    <p className="text-sm text-gray-600">We're preparing your order for shipment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Shipping</h4>
                    <p className="text-sm text-gray-600">Your order will be shipped within 1-2 business days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Tracking</h4>
                    <p className="text-sm text-gray-600">You'll receive tracking information via email</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button asChild className="w-full">
                <a href={`/account/orders/${order.id}`}>View Order Details</a>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <a href="/shop">Continue Shopping</a>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <a href="/account/orders">View Order History</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need help with your order?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => window.location.href = '/support'}>
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/faq'}>
              Help Center
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};