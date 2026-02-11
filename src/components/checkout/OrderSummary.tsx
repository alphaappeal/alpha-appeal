import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCheckoutCart, useCheckoutPromo, useCheckoutPayment, useCheckoutAddresses } from '@/lib/stores/checkoutStore';
import { formatZAR } from '@/lib/currency';
import { useCartTotals } from '@/lib/stores/cartStore';
import { ShoppingCart, Truck, Percent, Star, AlertCircle } from 'lucide-react';
import { calculateShippingCost, getShippingBreakdown } from '@/lib/utils/shippingCalculator';

interface OrderSummaryProps {
  className?: string;
  isMobile?: boolean;
  onEditCart?: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  className = '',
  isMobile = false,
  onEditCart 
}) => {
  const cartItems = useCheckoutCart();
  const { promoDiscount, promoCodeValid, promoCode } = useCheckoutPromo();
  const { loyaltyPointsUsed } = useCheckoutPayment();
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50; // Standard shipping
  const vat = (subtotal + shipping) * 0.15;
  const total = Math.max(0, subtotal + shipping + vat - promoDiscount - loyaltyPointsUsed);

  // Get item summary for mobile
  const getItemSummary = () => {
    if (cartItems.length === 0) return 'Empty cart';
    if (cartItems.length === 1) return cartItems[0].product.product_name;
    
    const firstItem = cartItems[0].product.product_name;
    const remainingCount = cartItems.length - 1;
    return `${firstItem} + ${remainingCount} more`;
  };

  if (isMobile) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-gray-600" />
              <CardTitle className="text-sm font-medium">Order Summary</CardTitle>
              <Badge variant="outline" className="text-xs">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{formatZAR(total)}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
          <CardDescription className="text-xs text-gray-600 mt-1">
            {getItemSummary()}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 text-sm">
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
                <span className="flex items-center space-x-1">
                  <Percent className="w-3 h-3" />
                  <span>Promo Discount</span>
                </span>
                <span>- {formatZAR(promoDiscount)}</span>
              </div>
            )}
            
            {loyaltyPointsUsed > 0 && (
              <div className="flex justify-between text-blue-600 font-medium">
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>Loyalty Points</span>
                </span>
                <span>- {formatZAR(loyaltyPointsUsed)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatZAR(total)}</span>
            </div>
          </div>
          
          {onEditCart && (
            <button
              onClick={onEditCart}
              className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit Cart
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`sticky top-24 border-gray-200 shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <div>
              <CardTitle className="text-lg">Order Summary</CardTitle>
              <CardDescription>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{formatZAR(total)}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cart Items Preview */}
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.product.product_images && item.product.product_images.length > 0 ? (
                  <img
                    src={item.product.product_images[0].image_url}
                    alt={item.product.product_images[0].alt_text || item.product.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {item.product.product_name}
                </h4>
                {item.variant && (
                  <p className="text-xs text-gray-600 mt-1">Variant: {item.variant.variant_name}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-600">x {item.quantity}</span>
                  <span className="text-sm font-medium">{formatZAR(item.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatZAR(subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 flex items-center space-x-1">
              <Truck className="w-3 h-3" />
              <span>Shipping</span>
            </span>
            <span>{formatZAR(shipping)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">VAT (15%)</span>
            <span>{formatZAR(vat)}</span>
          </div>

          {/* Discounts */}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span className="flex items-center space-x-1">
                <Percent className="w-3 h-3" />
                <span>Promo: {promoCode}</span>
              </span>
              <span>- {formatZAR(promoDiscount)}</span>
            </div>
          )}
          
          {loyaltyPointsUsed > 0 && (
            <div className="flex justify-between text-blue-600 font-medium">
              <span className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Loyalty Points</span>
              </span>
              <span>- {formatZAR(loyaltyPointsUsed)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>{formatZAR(total)}</span>
          </div>
          
          {/* Shipping Info */}
          <div className="mt-2 text-xs text-gray-600 flex items-center space-x-1">
            <Truck className="w-3 h-3" />
            <span>Shipping calculated at next step</span>
          </div>
        </div>

        {/* Actions */}
        {onEditCart && (
          <div className="space-y-2 pt-3 border-t border-gray-200">
            <button
              onClick={onEditCart}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit Cart
            </button>
            
            <div className="text-xs text-gray-500 text-center">
              Changes will update your order total
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Compact version for mobile checkout steps
export const CompactOrderSummary: React.FC<{ total: number }> = ({ total }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Order Total</div>
            <div className="text-sm text-gray-600">Including VAT and shipping</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{formatZAR(total)}</div>
          <div className="text-xs text-gray-500">Final amount</div>
        </div>
      </div>
    </div>
  );
};