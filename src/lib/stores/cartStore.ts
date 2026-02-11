import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/components/shop/ProductCard';
import { CartItem, CartTotals, ProductVariant } from '@/lib/types/cart';
import { supabase } from '@/lib/supabase/client';

interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  discount: number;
  loyaltyPointsUsed: number;
  isLoading: boolean;

  // Actions
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
  setDiscount: (amount: number) => void;
  setLoyaltyPointsUsed: (points: number) => void;
  syncWithSupabase: (userId: string) => Promise<void>;
  loadFromSupabase: (userId: string) => Promise<void>;
}

// Constants
const SHIPPING_COST = 50;
const VAT_RATE = 0.15;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      shipping: SHIPPING_COST,
      vat: 0,
      total: 0,
      discount: 0,
      loyaltyPointsUsed: 0,
      isLoading: false,

      addItem: async (product: Product, variant?: ProductVariant, quantity = 1) => {
        const state = get();
        const stateItems = state.items;
        
        // Check if item already exists
        const existingItem = stateItems.find(
          item => item.product_id === product.id && item.variant_id === variant?.id
        );

        if (existingItem) {
          // Update existing item quantity
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            variant ? variant.stock_quantity : product.stock_quantity
          );
          
          const updatedItems = stateItems.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: newQuantity }
              : item
          );

          set({ items: updatedItems }, false);
        } else {
          // Add new item
          const maxQuantity = variant ? variant.stock_quantity : product.stock_quantity;
          const finalQuantity = Math.min(quantity, maxQuantity);

          const newItem: CartItem = {
            id: `${product.id}-${variant?.id || 'default'}`,
            product_id: product.id,
            variant_id: variant?.id,
            quantity: finalQuantity,
            price: product.price + (variant?.price_adjustment || 0),
            product,
            variant
          };

          set({ items: [...stateItems, newItem] }, false);
        }

        // Calculate totals
        state.calculateTotals();
      },

      removeItem: (itemId: string) => {
        const state = get();
        const updatedItems = state.items.filter(item => item.id !== itemId);
        set({ items: updatedItems }, false);
        state.calculateTotals();
      },

      updateQuantity: (itemId: string, quantity: number) => {
        const state = get();
        const updatedItems = state.items.map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        );
        set({ items: updatedItems }, false);
        state.calculateTotals();
      },

      clearCart: () => {
        set({ items: [], subtotal: 0, shipping: SHIPPING_COST, vat: 0, total: 0, discount: 0, loyaltyPointsUsed: 0 });
      },

      calculateTotals: () => {
        const state = get();
        const stateItems = state.items;
        const stateDiscount = state.discount;
        const stateLoyaltyPointsUsed = state.loyaltyPointsUsed;

        // Calculate subtotal
        const subtotal = stateItems.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);

        // Calculate VAT
        const vat = subtotal * VAT_RATE;

        // Calculate total before discounts
        const totalBeforeDiscounts = subtotal + state.shipping + vat;

        // Calculate final total after discounts
        const totalAfterDiscounts = Math.max(0, totalBeforeDiscounts - stateDiscount - stateLoyaltyPointsUsed);

        set({
          subtotal,
          vat,
          total: totalAfterDiscounts
        });
      },

      setDiscount: (amount: number) => {
        set({ discount: amount }, false);
        get().calculateTotals();
      },

      setLoyaltyPointsUsed: (points: number) => {
        set({ loyaltyPointsUsed: points }, false);
        get().calculateTotals();
      },

      syncWithSupabase: async (userId: string) => {
        const state = get();
        set({ isLoading: true });

        try {
          // Clear existing cart items for user
          await supabase
            .from('shopping_cart')
            .delete()
            .eq('user_id', userId);

          // Add current cart items
          if (state.items.length > 0) {
            const cartItems = state.items.map(item => ({
              user_id: userId,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity
            }));

            await supabase
              .from('shopping_cart')
              .insert(cartItems);
          }
        } catch (error) {
          console.error('Error syncing cart with Supabase:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromSupabase: async (userId: string) => {
        set({ isLoading: true });

        try {
          const { data: cartItems, error } = await supabase
            .from('shopping_cart')
            .select(`
              *,
              products (
                *,
                product_images (
                  *
                ),
                product_variants (
                  *
                )
              )
            `)
            .eq('user_id', userId);

          if (error) {
            throw error;
          }

          if (cartItems && cartItems.length > 0) {
            const items: CartItem[] = cartItems.map(item => {
              const product = item.products;
              const variant = item.variant_id 
                ? product.product_variants.find(v => v.id === item.variant_id)
                : undefined;

              return {
                id: `${product.id}-${item.variant_id || 'default'}`,
                product_id: product.id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: product.price + (variant?.price_adjustment || 0),
                product: {
                  ...product,
                  product_images: product.product_images || [],
                  product_variants: product.product_variants || [],
                  product_categories: product.product_categories || { category_name: 'Uncategorized' },
                  reviews: []
                },
                variant
              };
            });

            set({ items }, false);
            get().calculateTotals();
          }
        } catch (error) {
          console.error('Error loading cart from Supabase:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        discount: state.discount,
        loyaltyPointsUsed: state.loyaltyPointsUsed
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate totals when rehydrating from storage
        if (state) {
          state.calculateTotals();
        }
      }
    }
  )
);

// Selector hooks for better performance
export const useCartItems = () => useCartStore(state => state.items);
export const useCartTotals = () => useCartStore(state => ({
  subtotal: state.subtotal,
  shipping: state.shipping,
  vat: state.vat,
  total: state.total,
  discount: state.discount,
  loyaltyPointsUsed: state.loyaltyPointsUsed
}));
export const useCartActions = () => useCartStore(state => ({
  addItem: state.addItem,
  removeItem: state.removeItem,
  updateQuantity: state.updateQuantity,
  clearCart: state.clearCart,
  setDiscount: state.setDiscount,
  setLoyaltyPointsUsed: state.setLoyaltyPointsUsed,
  syncWithSupabase: state.syncWithSupabase,
  loadFromSupabase: state.loadFromSupabase
}));
export const useCartLoading = () => useCartStore(state => state.isLoading);