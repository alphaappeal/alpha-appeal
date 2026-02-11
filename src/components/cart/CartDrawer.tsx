import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCartStore, useCartItems, useCartTotals, useCartActions } from '@/lib/stores/cartStore';
import { formatZAR } from '@/lib/currency';
import { ProductCard } from '@/components/shop/ProductCard';
import { CartItem } from '@/lib/types/cart';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const items = useCartItems();
  const { subtotal, shipping, vat, total, discount, loyaltyPointsUsed } = useCartTotals();
  const { removeItem, updateQuantity, clearCart } = useCartActions();
  const isLoading = useCartStore(state => state.isLoading);

  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleRemoveItem = async (itemId: string) => {
    setIsRemoving(itemId);
    try {
      removeItem(itemId);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    onClose();
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  const handleContinueShopping = () => {
    onClose();
  };

  if (items.length === 0) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <DrawerTitle className="text-2xl">Your Cart</DrawerTitle>
                  <DrawerDescription>{items.length} items</DrawerDescription>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-5 h-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="p-6 bg-gray-50 rounded-full mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Add some products to get started</p>
            <Button onClick={handleContinueShopping} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <DrawerTitle className="text-2xl">Your Cart</DrawerTitle>
                <DrawerDescription>{items.length} item{items.length !== 1 ? 's' : ''}</DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AnimatePresence mode="wait">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="border-b border-gray-200 py-4"
              >
                <div className="flex space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product.product_images && item.product.product_images.length > 0 ? (
                        <img
                          src={item.product.product_images[0].image_url}
                          alt={item.product.product_images[0].alt_text || item.product.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.product.product_name}</h4>
                    {item.variant && (
                      <p className="text-sm text-gray-600 mt-1">Variant: {item.variant.variant_name}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-gray-900">{formatZAR(item.price)}</span>
                      <span className="text-sm text-gray-500">x {item.quantity}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isRemoving === item.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {isRemoving === item.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>

                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Item Subtotal */}
                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-600">Subtotal: </span>
                  <span className="font-semibold">{formatZAR(item.price * item.quantity)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatZAR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>{formatZAR(shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">VAT (15%)</span>
              <span>{formatZAR(vat)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>- {formatZAR(discount)}</span>
              </div>
            )}
            {loyaltyPointsUsed > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>Loyalty Points</span>
                <span>- {formatZAR(loyaltyPointsUsed)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-2 mb-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatZAR(total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 py-3 text-base">
              <ArrowRight className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
            <Button onClick={handleContinueShopping} variant="outline" className="w-full py-3">
              Continue Shopping
            </Button>
            {items.length > 0 && (
              <Button onClick={clearCart} variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" disabled={isLoading}>
                Clear Cart
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};