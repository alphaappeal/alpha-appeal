import React from 'react';
import { useCheckoutCart, useCheckoutPromo, useCheckoutPayment } from '@/lib/stores/checkoutStore';
import { formatZAR } from '@/lib/currency';
import { cn } from "@/lib/utils";

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
  const { promoDiscount, promoCode } = useCheckoutPromo();
  const { loyaltyPointsUsed } = useCheckoutPayment();

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50; // Standard shipping
  const vat = (subtotal + shipping) * 0.15;
  const total = Math.max(0, subtotal + shipping + vat - promoDiscount - loyaltyPointsUsed);

  const breakdownItem = (label: string, value: number, isDiscount: boolean = false) => (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={cn(isDiscount ? "text-primary" : "text-white")}>
        {isDiscount && "- "}{formatZAR(value)}
      </span>
    </div>
  );

  return (
    <div className={cn("glass-panel rounded-2xl p-8 border border-white/5", className)}>
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-gray-400">shopping_bag</span>
          <div>
            <h3 className="font-display font-bold text-white uppercase tracking-wider">Order Summary</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white leading-none">{formatZAR(total)}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Total</p>
        </div>
      </div>

      {/* Cart Items Preview */}
      {!isMobile && (
        <div className="space-y-6 mb-8 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 group">
              <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/5 overflow-hidden flex-shrink-0">
                {item.product.product_images && item.product.product_images.length > 0 ? (
                  <img
                    src={item.product.product_images[0].image_url}
                    alt={item.product.product_images[0].alt_text || item.product.product_name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-700">image</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate uppercase tracking-wider">
                  {item.product.product_name}
                </h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                  <span className="text-sm font-bold text-white">{formatZAR(item.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-4 mb-8 pt-6 border-t border-white/5">
        {breakdownItem("Subtotal", subtotal)}
        {breakdownItem("Shipping", shipping)}
        {breakdownItem("VAT (15%)", vat)}

        {promoDiscount > 0 && breakdownItem(`Promo: ${promoCode}`, promoDiscount, true)}
        {loyaltyPointsUsed > 0 && breakdownItem("Loyalty Points", loyaltyPointsUsed, true)}
      </div>

      {/* Final Total */}
      <div className="pt-6 border-t border-primary/20 bg-primary/5 -mx-8 px-8 rounded-b-2xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-white font-bold uppercase tracking-widest text-xs">Total Amount</span>
          <span className="text-3xl font-bold text-white">{formatZAR(total)}</span>
        </div>

        {onEditCart && (
          <button
            onClick={onEditCart}
            className="w-full py-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white border border-white/5 hover:border-primary/30 rounded-xl transition-all"
          >
            Modify Cart Selections
          </button>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <span className="material-symbols-outlined text-xs">lock</span>
          Secure Checkout
        </div>
      </div>
    </div>
  );
};

export const CompactOrderSummary: React.FC<{ total: number }> = ({ total }) => {
  return (
    <div className="glass-panel border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider">Order Total</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Inc. VAT & Shipping</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white leading-none">{formatZAR(total)}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 text-primary">Final Amount</div>
        </div>
      </div>
    </div>
  );
};