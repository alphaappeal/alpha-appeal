import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCartActions } from '@/lib/stores/cartStore';
import { Product, ProductVariant } from '@/lib/types/cart';
import { useToast } from '@/components/ui/use-toast';
import { formatZAR } from '@/lib/currency';

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  disabled?: boolean;
  isLoading?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  variant,
  quantity,
  disabled = false,
  isLoading = false
}) => {
  const { addItem } = useCartActions();
  const { toast } = useToast();
  const totalAmount = quantity * (product.price + (variant?.price_adjustment || 0));

  const handleAddToCart = async () => {
    if (disabled || isLoading) return;

    try {
      await addItem(product, variant, quantity);
      toast({
        title: "Added to Cart",
        description: `${product.product_name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      className={`
        w-full py-3 px-6 text-lg font-semibold transition-all duration-300
        ${disabled || isLoading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
          : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
        }
      `}
      aria-label={`Add ${quantity} item(s) to cart for ${formatZAR(totalAmount)}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Adding to Cart...
        </>
      ) : disabled ? (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Out of Stock
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart • {formatZAR(totalAmount)}
        </>
      )}
    </Button>
  );
};
