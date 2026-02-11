import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutCart, useCheckoutPromo, useCheckoutActions, useCheckoutErrors } from '@/lib/stores/checkoutStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { formatZAR } from '@/lib/currency';
import { ShoppingCart, Edit, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { PromoCodeInput } from './PromoCodeInput';

interface CartItemDisplay {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  variant_name?: string;
  image_url?: string;
  stock_quantity: number;
  is_available: boolean;
}

export const CheckoutStep1: React.FC = () => {
  const cartItems = useCheckoutCart();
  const { promoDiscount, promoCodeValid, promoCode } = useCheckoutPromo();
  const { validateOrder, loadCartItems } = useCheckoutActions();
  const errors = useCheckoutErrors();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isStockValidating, setIsStockValidating] = useState(false);
  const [displayItems, setDisplayItems] = useState<CartItemDisplay[]>([]);

  // Format cart items for display
  useEffect(() => {
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      product_name: item.product.product_name,
      price: item.price,
      quantity: item.quantity,
      variant_name: item.variant?.variant_name,
      image_url: item.product.product_images?.[0]?.image_url,
      stock_quantity: item.variant?.stock_quantity || item.product.stock_quantity,
      is_available: true // Will be validated
    }));
    setDisplayItems(formattedItems);
  }, [cartItems]);

  // Validate stock availability
  const validateStock = async () => {
    setIsStockValidating(true);
    try {
      // This would normally call Supabase to check stock
      // For now, we'll simulate the validation
      const updatedItems = await Promise.all(
        displayItems.map(async (item) => {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // In real implementation, check against Supabase
          const isAvailable = item.quantity <= item.stock_quantity;
          
          return {
            ...item,
            is_available: isAvailable
          };
        })
      );
      
      setDisplayItems(updatedItems);
      
      const hasOutOfStock = updatedItems.some(item => !item.is_available);
      if (hasOutOfStock) {
        toast({
          title: "Stock Issues",
          description: "Some items in your cart are out of stock or have insufficient quantity.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error validating stock:', error);
      toast({
        title: "Error",
        description: "Failed to validate stock availability.",
        variant: "destructive",
      });
    } finally {
      setIsStockValidating(false);
    }
  };

  // Handle continue to next step
  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const isValid = await validateOrder();
      
      if (isValid) {
        // Navigate to next step
        window.location.href = '/checkout/shipping';
      } else {
        // Show validation errors
        Object.values(errors).forEach(error => {
          if (error) {
            toast({
              title: "Validation Error",
              description: error,
              variant: "destructive",
            });
          }
        });
      }
    } catch (error) {
      console.error('Error validating order:', error);
      toast({
        title: "Error",
        description: "Failed to validate your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit cart
  const handleEditCart = () => {
    // This would open the cart drawer
    // For now, we'll navigate to shop
    window.location.href = '/shop';
  };

  // Handle refresh stock
  const handleRefreshStock = () => {
    loadCartItems();
    validateStock();
  };

  // Calculate totals
  const subtotal = displayItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const vat = (subtotal + shipping) * 0.15;
  const total = Math.max(0, subtotal + shipping + vat - promoDiscount);

  // Check if all items are available
  const allItemsAvailable = displayItems.every(item => item.is_available);
  const hasOutOfStockItems = displayItems.some(item => !item.is_available);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Your Order</h2>
          <p className="text-gray-600 mt-1">Please review your items before proceeding to shipping.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleEditCart}
            className="text-gray-600 hover:text-gray-900"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Cart
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRefreshStock}
            disabled={isStockValidating}
            className="text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isStockValidating ? 'animate-spin' : ''}`} />
            Refresh Stock
          </Button>
        </div>
      </div>

      {/* Stock Status */}
      {hasOutOfStockItems && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Some items have stock issues</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Please review the items below. You may need to adjust quantities or remove unavailable items.
          </p>
        </div>
      )}

      {/* Cart Items */}
      <div className="space-y-4">
        {displayItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600">Add some products to get started</p>
            <Button onClick={handleEditCart} className="mt-4">
              Continue Shopping
            </Button>
          </div>
        ) : (
          displayItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center space-x-4 p-4 border rounded-lg ${
                item.is_available ? 'border-gray-200' : 'border-red-200 bg-red-50'
              }`}
            >
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                {item.variant_name && (
                  <p className="text-sm text-gray-600 mt-1">Variant: {item.variant_name}</p>
                )}
                
                {/* Stock Status */}
                {!item.is_available && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Out of Stock</span>
                  </div>
                )}
                
                {item.is_available && item.quantity > item.stock_quantity * 0.8 && (
                  <div className="flex items-center space-x-2 mt-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Only {item.stock_quantity} left in stock</span>
                  </div>
                )}
              </div>

              {/* Price and Quantity */}
              <div className="text-right flex flex-col items-end space-y-1">
                <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                <div className="font-semibold text-gray-900">
                  {formatZAR(item.price * item.quantity)}
                </div>
                {item.price !== item.price && (
                  <div className="text-xs text-gray-500 line-through">
                    {formatZAR(item.price * item.quantity)}
                  </div>
                )}
              </div>

              {/* Availability Indicator */}
              <div className="flex-shrink-0">
                {item.is_available ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Promo Code Section */}
      <div className="border-t border-gray-200 pt-6">
        <PromoCodeInput />
      </div>

      {/* Price Summary */}
      <div className="border-t border-gray-200 pt-6">
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
              <span>Promo Code Applied</span>
              <span>- {formatZAR(promoDiscount)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatZAR(total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          By continuing, you agree to our terms and conditions
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleEditCart}
            disabled={isLoading}
          >
            Edit Cart
          </Button>
          
          <Button
            onClick={handleContinue}
            disabled={isLoading || !allItemsAvailable || displayItems.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              'Continue to Shipping'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};