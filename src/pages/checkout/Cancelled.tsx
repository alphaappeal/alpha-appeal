import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Home, ShoppingCart, Clock, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const CheckoutCancelled: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  const handleTryAgain = () => {
    if (orderId) {
      // Redirect to checkout with the order ID to retry payment
      window.location.href = `/checkout/payment?retry=${orderId}`;
    } else {
      // Start checkout process again
      window.location.href = '/checkout';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cancelled Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">
            Your payment was cancelled. Don't worry, your cart has been saved and you can try again anytime.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What Happened?</CardTitle>
            <CardDescription>Your payment process was interrupted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900">Payment Not Completed</h4>
                  <p className="text-sm text-yellow-700">
                    Your order is still in your cart and will be available for the next 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Next Steps</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <div>
                    <h5 className="font-medium">Try Again</h5>
                    <p className="text-sm text-gray-600">Complete your payment with a different method</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  <div>
                    <h5 className="font-medium">Continue Shopping</h5>
                    <p className="text-sm text-gray-600">Add more items to your cart</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Home className="w-5 h-5 text-purple-600" />
                  <div>
                    <h5 className="font-medium">Return Home</h5>
                    <p className="text-sm text-gray-600">Browse our products and collections</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            {orderId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Order Information</h4>
                <p className="text-sm text-blue-700">
                  Order ID: <span className="font-mono font-semibold">{orderId}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Keep this order ID for reference if you need to contact support.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <Button onClick={handleTryAgain} className="w-full bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <a href="/shop">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue Shopping
            </a>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <a href="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </a>
          </Button>
        </div>

        {/* Customer Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need help with your payment?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => window.location.href = '/support'}>
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/faq'}>
              Payment Help
            </Button>
          </div>
          
          {/* Payment Methods */}
          <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Accepted Payment Methods</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium">Credit Card</div>
                <div className="text-xs text-gray-500">Visa, Mastercard</div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium">EFT</div>
                <div className="text-xs text-gray-500">Instant EFT</div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium">SnapScan</div>
                <div className="text-xs text-gray-500">Mobile Payment</div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium">Cash on Delivery</div>
                <div className="text-xs text-gray-500">Pay on Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};