import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, ShippingAddress, PaymentMethod, OrderFormData } from '@/lib/types/cart';
import { useCartStore } from './cartStore';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface CheckoutState {
  // Step Management
  currentStep: 1 | 2 | 3 | 4;
  isProcessing: boolean;
  
  // Cart Integration
  cartItems: CartItem[];
  
  // Address Management
  shippingAddress: ShippingAddress | null;
  billingAddress: ShippingAddress | null;
  savedAddresses: ShippingAddress[];
  
  // Payment Methods
  paymentMethod: 'payfast' | 'cod' | 'loyalty_points' | null;
  loyaltyPointsUsed: number;
  loyaltyPointsAvailable: number;
  
  // Promo & Discounts
  promoCode: string | null;
  promoCodeValid: boolean;
  promoDiscount: number;
  
  // Order Management
  orderId: string | null;
  orderStatus: 'draft' | 'pending' | 'confirmed' | 'cancelled';
  
  // Error Handling
  errors: { [key: string]: string };
  
  // Actions
  setCurrentStep: (step: 1 | 2 | 3 | 4) => void;
  setProcessing: (processing: boolean) => void;
  loadCartItems: () => void;
  
  // Address Management
  setShippingAddress: (address: ShippingAddress) => void;
  setBillingAddress: (address: ShippingAddress) => void;
  loadSavedAddresses: (userId: string) => Promise<void>;
  saveNewAddress: (address: Omit<ShippingAddress, 'id' | 'user_id'>, userId: string) => Promise<void>;
  
  // Payment Methods
  setPaymentMethod: (method: 'payfast' | 'cod' | 'loyalty_points') => void;
  setLoyaltyPointsUsed: (points: number) => void;
  loadLoyaltyPoints: (userId: string) => Promise<void>;
  
  // Promo Codes
  setPromoCode: (code: string) => Promise<void>;
  clearPromoCode: () => void;
  
  // Order Management
  createOrder: (userId: string) => Promise<string>;
  validateOrder: () => Promise<boolean>;
  resetCheckout: () => void;
  
  // Error Handling
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      isProcessing: false,
      cartItems: [],
      shippingAddress: null,
      billingAddress: null,
      savedAddresses: [],
      paymentMethod: null,
      loyaltyPointsUsed: 0,
      loyaltyPointsAvailable: 0,
      promoCode: null,
      promoCodeValid: false,
      promoDiscount: 0,
      orderId: null,
      orderStatus: 'draft',
      errors: {},

      // Step Management
      setCurrentStep: (step) => set({ currentStep: step }),
      setProcessing: (processing) => set({ isProcessing: processing }),
      
      // Cart Integration
      loadCartItems: () => {
        const cartItems = useCartStore.getState().items;
        set({ cartItems });
      },

      // Address Management
      setShippingAddress: (address) => set({ shippingAddress: address }),
      setBillingAddress: (address) => set({ billingAddress: address }),
      
      loadSavedAddresses: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('shipping_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          set({ savedAddresses: data || [] });
        } catch (error) {
          console.error('Error loading saved addresses:', error);
          toast({
            title: "Error",
            description: "Failed to load saved addresses.",
            variant: "destructive",
          });
        }
      },

      saveNewAddress: async (address, userId: string) => {
        try {
          const { data, error } = await supabase
            .from('shipping_addresses')
            .insert([{
              ...address,
              user_id: userId
            }])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            savedAddresses: [data, ...state.savedAddresses]
          }));

          toast({
            title: "Address Saved",
            description: "Your address has been saved successfully.",
          });
        } catch (error) {
          console.error('Error saving address:', error);
          toast({
            title: "Error",
            description: "Failed to save address.",
            variant: "destructive",
          });
        }
      },

      // Payment Methods
      setPaymentMethod: (method) => {
        const state = get();
        
        // Reset loyalty points if switching away from loyalty points
        if (state.paymentMethod === 'loyalty_points' && method !== 'loyalty_points') {
          set({ paymentMethod: method, loyaltyPointsUsed: 0 });
        } else {
          set({ paymentMethod: method });
        }
      },

      setLoyaltyPointsUsed: (points) => {
        const state = get();
        const maxPoints = Math.min(points, state.loyaltyPointsAvailable);
        set({ loyaltyPointsUsed: maxPoints });
      },

      loadLoyaltyPoints: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('loyalty_points')
            .eq('user_id', userId)
            .single();

          if (error) throw error;
          
          set({ loyaltyPointsAvailable: data?.loyalty_points || 0 });
        } catch (error) {
          console.error('Error loading loyalty points:', error);
        }
      },

      // Promo Codes
      setPromoCode: async (code: string) => {
        set({ promoCode: code, promoCodeValid: false, promoDiscount: 0 });
        
        try {
          const response = await fetch('/api/validate-promo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              user_id: 'current_user_id', // Will be replaced with actual user ID
              cart_total: get().cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            })
          });

          const result = await response.json();

          if (result.valid) {
            set({ 
              promoCodeValid: true, 
              promoDiscount: result.discount_amount,
              promoCode: code 
            });
            toast({
              title: "Promo Code Applied",
              description: `You saved R ${result.discount_amount.toFixed(2)}`,
            });
          } else {
            set({ promoCodeValid: false, promoDiscount: 0 });
            toast({
              title: "Invalid Promo Code",
              description: result.message,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error validating promo code:', error);
          set({ promoCodeValid: false, promoDiscount: 0 });
          toast({
            title: "Error",
            description: "Failed to validate promo code.",
            variant: "destructive",
          });
        }
      },

      clearPromoCode: () => {
        set({ 
          promoCode: null, 
          promoCodeValid: false, 
          promoDiscount: 0 
        });
      },

      // Order Management
      validateOrder: async (): Promise<boolean> => {
        const state = get();
        const errors: { [key: string]: string } = {};

        // Validate cart items
        if (state.cartItems.length === 0) {
          errors.cart = "Your cart is empty";
        }

        // Validate stock
        for (const item of state.cartItems) {
          const { data: product, error } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (error || !product) {
            errors.cart = "One or more items are no longer available";
            break;
          }

          const availableStock = item.variant_id 
            ? item.variant?.stock_quantity 
            : product.stock_quantity;

          if (item.quantity > availableStock) {
            errors.cart = `Insufficient stock for ${item.product.product_name}`;
            break;
          }
        }

        // Validate addresses
        if (!state.shippingAddress) {
          errors.shipping = "Please provide a shipping address";
        }

        if (!state.billingAddress) {
          errors.billing = "Please provide a billing address";
        }

        // Validate payment method
        if (!state.paymentMethod) {
          errors.payment = "Please select a payment method";
        }

        // Validate loyalty points if using them
        if (state.paymentMethod === 'loyalty_points' && state.loyaltyPointsUsed > state.loyaltyPointsAvailable) {
          errors.payment = "Insufficient loyalty points";
        }

        set({ errors });
        return Object.keys(errors).length === 0;
      },

      createOrder: async (userId: string): Promise<string> => {
        const state = get();
        set({ isProcessing: true });

        try {
          // Calculate totals
          const subtotal = state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const shipping = 50; // Standard shipping
          const vat = (subtotal + shipping) * 0.15;
          const total = Math.max(0, subtotal + shipping + vat - state.promoDiscount - state.loyaltyPointsUsed);

          // Create order
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: userId,
              status: 'pending',
              subtotal,
              shipping_cost: shipping,
              vat_amount: vat,
              discount_amount: state.promoDiscount + state.loyaltyPointsUsed,
              total_amount: total,
              currency: 'ZAR',
              payment_method: state.paymentMethod,
              shipping_address: state.shippingAddress,
              billing_address: state.billingAddress
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // Create order items
          const orderItems = state.cartItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) throw itemsError;

          // Deduct loyalty points if used
          if (state.loyaltyPointsUsed > 0) {
            const { error: pointsError } = await supabase
              .from('user_profiles')
              .update({
                loyalty_points: state.loyaltyPointsAvailable - state.loyaltyPointsUsed
              })
              .eq('user_id', userId);

            if (pointsError) throw pointsError;
          }

          // Clear cart
          useCartStore.getState().clearCart();

          set({ 
            orderId: order.id, 
            orderStatus: 'pending',
            isProcessing: false 
          });

          return order.id;
        } catch (error) {
          console.error('Error creating order:', error);
          set({ isProcessing: false });
          throw error;
        }
      },

      resetCheckout: () => {
        set({
          currentStep: 1,
          isProcessing: false,
          shippingAddress: null,
          billingAddress: null,
          paymentMethod: null,
          loyaltyPointsUsed: 0,
          promoCode: null,
          promoCodeValid: false,
          promoDiscount: 0,
          orderId: null,
          orderStatus: 'draft',
          errors: {}
        });
      },

      // Error Handling
      setError: (field, message) => {
        set(state => ({
          errors: { ...state.errors, [field]: message }
        }));
      },

      clearError: (field) => {
        set(state => {
          const newErrors = { ...state.errors };
          delete newErrors[field];
          return { errors: newErrors };
        });
      },

      clearAllErrors: () => {
        set({ errors: {} });
      }
    }),
    {
      name: 'checkout-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        paymentMethod: state.paymentMethod,
        loyaltyPointsUsed: state.loyaltyPointsUsed,
        promoCode: state.promoCode,
        promoCodeValid: state.promoCodeValid,
        promoDiscount: state.promoDiscount
      })
    }
  )
);

// Selector hooks for better performance
export const useCheckoutStep = () => useCheckoutStore(state => state.currentStep);
export const useCheckoutCart = () => useCheckoutStore(state => state.cartItems);
export const useCheckoutAddresses = () => useCheckoutStore(state => ({
  shippingAddress: state.shippingAddress,
  billingAddress: state.billingAddress,
  savedAddresses: state.savedAddresses
}));
export const useCheckoutPayment = () => useCheckoutStore(state => ({
  paymentMethod: state.paymentMethod,
  loyaltyPointsUsed: state.loyaltyPointsUsed,
  loyaltyPointsAvailable: state.loyaltyPointsAvailable
}));
export const useCheckoutPromo = () => useCheckoutStore(state => ({
  promoCode: state.promoCode,
  promoCodeValid: state.promoCodeValid,
  promoDiscount: state.promoDiscount
}));
export const useCheckoutOrder = () => useCheckoutStore(state => ({
  orderId: state.orderId,
  orderStatus: state.orderStatus,
  isProcessing: state.isProcessing
}));
export const useCheckoutErrors = () => useCheckoutStore(state => state.errors);
export const useCheckoutActions = () => useCheckoutStore(state => ({
  setCurrentStep: state.setCurrentStep,
  setProcessing: state.setProcessing,
  loadCartItems: state.loadCartItems,
  setShippingAddress: state.setShippingAddress,
  setBillingAddress: state.setBillingAddress,
  loadSavedAddresses: state.loadSavedAddresses,
  saveNewAddress: state.saveNewAddress,
  setPaymentMethod: state.setPaymentMethod,
  setLoyaltyPointsUsed: state.setLoyaltyPointsUsed,
  loadLoyaltyPoints: state.loadLoyaltyPoints,
  setPromoCode: state.setPromoCode,
  clearPromoCode: state.clearPromoCode,
  createOrder: state.createOrder,
  validateOrder: state.validateOrder,
  resetCheckout: state.resetCheckout,
  setError: state.setError,
  clearError: state.clearError,
  clearAllErrors: state.clearAllErrors
}));