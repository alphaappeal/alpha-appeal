import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
    id: string; // Cart item ID
    product_id: string;
    quantity: number;
    product?: any; // Expanded product details
}

interface CartContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    items: CartItem[];
    total: number;
    itemCount: number;
    loading: boolean;
    addItem: (productId: string, quantity?: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
    isOpen: false,
    setIsOpen: () => { },
    items: [],
    total: 0,
    itemCount: 0,
    loading: false,
    addItem: async () => { },
    removeItem: async () => { },
    updateQuantity: async () => { },
    clearCart: async () => { },
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    // Calculate totals
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const total = items.reduce((acc, item) => {
        const price = item.product?.price || 0;
        return acc + (price * item.quantity);
    }, 0);

    // Fetch cart when user changes
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setItems([]);
        }
    }, [user]);

    const fetchCart = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from('shopping_cart')
                .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            product_name,
            price,
            image_url,
            slug
          )
        `)
                .eq('user_id', user.id);

            if (error) throw error;

            // Transform data to match CartItem interface
            const formattedItems = data.map((item: any) => ({
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                product: item.products // Supabase returns joined data here
            }));

            setItems(formattedItems);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (productId: string, quantity: number = 1) => {
        if (!user) {
            setIsOpen(true); // Open cart to prompt login (or show empty state)
            toast({
                title: "Please sign in",
                description: "You need to be signed in to add items to your cart.",
                variant: "destructive"
            });
            return;
        }

        try {
            // Optimistic update (optional, but good for UX)
            // Check if item exists
            const existingItem = items.find(item => item.product_id === productId);

            if (existingItem) {
                await updateQuantity(existingItem.id, existingItem.quantity + quantity);
            } else {
                const { error } = await (supabase as any)
                    .from('shopping_cart')
                    .insert({
                        user_id: user.id,
                        product_id: productId,
                        quantity: quantity
                    });

                if (error) throw error;
                await fetchCart(); // Refresh cart
                setIsOpen(true);
                toast({ title: "Added to cart" });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast({ title: "Error adding to cart", variant: "destructive" });
        }
    };

    const removeItem = async (itemId: string) => {
        if (!user) return;
        try {
            const { error } = await (supabase as any)
                .from('shopping_cart')
                .delete()
                .eq('id', itemId);

            if (error) throw error;
            setItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (!user) return;
        if (quantity < 1) {
            await removeItem(itemId);
            return;
        }

        try {
            const { error } = await (supabase as any)
                .from('shopping_cart')
                .update({ quantity })
                .eq('id', itemId);

            if (error) throw error;
            setItems(prev => prev.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            ));
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const clearCart = async () => {
        // Implementation for clearing cart
        if (!user) return;
        try {
            const { error } = await (supabase as any)
                .from('shopping_cart')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
            setItems([]);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    return (
        <CartContext.Provider value={{
            isOpen,
            setIsOpen,
            items,
            total,
            itemCount,
            loading,
            addItem,
            removeItem,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
