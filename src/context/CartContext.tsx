
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variantId?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType>({
    items: [],
    addItem: () => { },
    removeItem: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    cartTotal: 0,
    itemCount: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Load from local storage on init
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("alpha-cart");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    useEffect(() => {
        // Save to local storage on change
        localStorage.setItem("alpha-cart", JSON.stringify(items));
    }, [items]);

    const addItem = (newItem: CartItem) => {
        setItems((currentItems) => {
            const existingItem = currentItems.find(
                (item) => item.id === newItem.id && item.variantId === newItem.variantId
            );

            if (existingItem) {
                toast.info("Item quantity updated in cart");
                return currentItems.map((item) =>
                    item.id === newItem.id && item.variantId === newItem.variantId
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }

            toast.success("Added to cart");
            return [...currentItems, newItem];
        });
    };

    const removeItem = (itemId: string) => {
        setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
        toast.info("Removed from cart");
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(itemId);
            return;
        }
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem("alpha-cart");
    };

    const cartTotal = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                cartTotal,
                itemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
