import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutCart, useCheckoutPromo, useCheckoutActions, useCheckoutErrors } from '@/lib/stores/checkoutStore';
import { formatZAR } from '@/lib/currency';
import { PromoCodeInput } from './PromoCodeInput';
import { cn } from "@/lib/utils";

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
  const { promoDiscount } = useCheckoutPromo();
  const { validateOrder, loadCartItems } = useCheckoutActions();
  const errors = useCheckoutErrors();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isStockValidating, setIsStockValidating] = useState(false);
  const [displayItems, setDisplayItems] = useState<CartItemDisplay[]>([]);

  useEffect(() => {
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      product_name: item.product.product_name,
      price: item.price,
      quantity: item.quantity,
      variant_name: item.variant?.variant_name,
      image_url: item.product.product_images?.[0]?.image_url,
      stock_quantity: item.variant?.stock_quantity || item.product.stock_quantity,
      is_available: true
    }));
    setDisplayItems(formattedItems);
  }, [cartItems]);

  const validateStock = async () => {
    setIsStockValidating(true);
    try {
      const updatedItems = await Promise.all(
        displayItems.map(async (item) => {
          await new Promise(resolve => setTimeout(resolve, 500));
          const isAvailable = item.quantity <= item.stock_quantity;
          return { ...item, is_available: isAvailable };
        })
      );

      setDisplayItems(updatedItems);

      const hasOutOfStock = updatedItems.some(item => !item.is_available);
      if (hasOutOfStock) {
        toast({
          title: "Inventory Notice",
          description: "Some items in your cart have limited availability.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error validating stock:', error);
    } finally {
      setIsStockValidating(false);
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const isValid = await validateOrder();
      if (isValid) {
        window.location.href = '/checkout/shipping';
      } else {
        Object.values(errors).forEach(error => {
          if (error) {
            toast({
              title: "Information Required",
              description: error,
              variant: "destructive",
            });
          }
        });
      }
    } catch (error) {
      console.error('Error validating order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCart = () => {
    window.location.href = '/shop';
  };

  const handleRefreshStock = () => {
    loadCartItems();
    validateStock();
  };

  const subtotal = displayItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const vat = (subtotal + shipping) * 0.15;
  const total = Math.max(0, subtotal + shipping + vat - promoDiscount);

  const allItemsAvailable = displayItems.every(item => item.is_available);
  const hasOutOfStockItems = displayItems.some(item => !item.is_available);

  return (
    <div className="space-y-10">
      {/* Header Area */}
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wider">Order Items</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Review your selections</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRefreshStock}
            disabled={isStockValidating}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors"
          >
            <span className={cn("material-symbols-outlined text-sm", isStockValidating ? "animate-spin" : "")}>refresh</span>
            Update Inventory
          </button>
        </div>
      </div>

      {/* Stock Warning */}
      {hasOutOfStockItems && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4">
          <span className="material-symbols-outlined text-red-500">warning</span>
          <div>
            <p className="text-white text-sm font-bold uppercase tracking-wider">Inventory Restriction</p>
            <p className="text-red-200/60 text-xs mt-1">Some items are currently unavailable in the requested quantity. Please adjust your selections.</p>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {displayItems.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <span className="material-symbols-outlined text-gray-600 text-5xl mb-4">shopping_cart</span>
            <h3 className="text-white font-bold uppercase tracking-widest">Cart is empty</h3>
            <p className="text-gray-500 text-xs mt-2">Discover our curated botanical collection</p>
            <Button onClick={handleEditCart} className="mt-8 bg-primary hover:bg-primary-dark text-white font-bold">
              Shop Now
            </Button>
          </div>
        ) : (
          displayItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-6 p-6 rounded-2xl border transition-all duration-300",
                item.is_available ? "bg-white/5 border-white/5 hover:bg-white/[0.07]" : "bg-red-500/5 border-red-500/20"
              )}
            >
              <div className="w-20 h-20 bg-white/5 rounded-xl border border-white/5 overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <span className="material-symbols-outlined text-3xl">image</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white uppercase tracking-wider">{item.product_name}</h4>
                {item.variant_name && (
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Format: {item.variant_name}</p>
                )}

                {!item.is_available && (
                  <div className="mt-3 inline-flex items-center gap-2 text-red-500">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold">Currently Unavailable</span>
                  </div>
                )}

                {item.is_available && item.quantity > item.stock_quantity * 0.8 && (
                  <div className="mt-3 inline-flex items-center gap-2 text-primary font-bold">
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                    <span className="text-[10px] uppercase tracking-widest">Limited Stock: Only {item.stock_quantity} remaining</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-widest">Quantity: {item.quantity}</p>
                <p className="text-xl font-bold text-white">{formatZAR(item.price * item.quantity)}</p>
              </div>

              <div className="flex-shrink-0">
                {item.is_available ? (
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-red-500">cancel</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Area */}
      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="w-full md:w-auto flex-1">
          <PromoCodeInput />
        </div>

        <div className="w-full md:w-auto flex gap-4 justify-end">
          <button
            onClick={handleEditCart}
            disabled={isLoading}
            className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white border border-white/5 hover:border-white/20 rounded-xl transition-all"
          >
            Edit Cart
          </button>

          <Button
            onClick={handleContinue}
            disabled={isLoading || !allItemsAvailable || displayItems.length === 0}
            className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-widest text-xs h-auto rounded-xl shadow-[0_0_20px_rgba(107,142,107,0.3)] transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                Shipping Details
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};