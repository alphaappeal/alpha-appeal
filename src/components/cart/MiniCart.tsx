import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, BadgePlus, BadgeMinus, BadgeX, ChevronDown, ChevronUp } from 'lucide-react';
import { useCartItems, useCartTotals } from '@/lib/stores/cartStore';
import { formatZAR } from '@/lib/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '@/lib/types/cart';

interface MiniCartProps {
  className?: string;
}

export const MiniCart: React.FC<MiniCartProps> = ({ className }) => {
  const items = useCartItems();
  const { total } = useCartTotals();
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const previewItems = items.slice(0, 3);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleViewCart = () => {
    setIsOpen(false);
    // Trigger cart drawer open (this would need to be connected to your cart drawer state)
    // For now, navigate to cart page
    window.location.href = '/cart';
  };

  return (
    <div className={`relative ${className}`} onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="relative group"
        aria-label={`Cart with ${itemCount} items`}
      >
        <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
        
        {/* Item Count Badge */}
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
          >
            {itemCount}
          </motion.div>
        )}
      </Button>

      {/* Preview Dropdown */}
      <AnimatePresence>
        {isOpen && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Shopping Cart</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggle}
                    className="w-6 h-6"
                  >
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-lg font-bold text-gray-900">
                {formatZAR(total)}
              </div>
            </div>

            {/* Items Preview */}
            <div className="max-h-64 overflow-y-auto">
              {previewItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
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
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {item.product.product_name}
                    </h4>
                    {item.variant && (
                      <p className="text-xs text-gray-600 mt-1">Variant: {item.variant.variant_name}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-medium text-gray-900">
                        {formatZAR(item.price)}
                      </span>
                      <span className="text-xs text-gray-500">x {item.quantity}</span>
                    </div>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right">
                    <span className="text-sm font-semibold">
                      {formatZAR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              {items.length > 3 && (
                <div className="text-xs text-gray-600 text-center pb-2 border-b border-gray-200">
                  +{items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}
                </div>
              )}
              
              <Button onClick={handleViewCart} className="w-full bg-green-600 hover:bg-green-700">
                View Cart
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/checkout'}
                className="w-full"
              >
                Checkout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State Animation */}
      <AnimatePresence>
        {isOpen && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <div className="p-4 text-center">
              <div className="p-3 bg-gray-50 rounded-full mx-auto mb-3 w-fit">
                <ShoppingCart className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-600 mb-3">Add some products to get started</p>
              <Button onClick={handleToggle} variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};