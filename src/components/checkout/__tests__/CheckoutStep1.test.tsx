import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutStep1 } from '../CheckoutStep1';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Create stable mock data
const mockCartItems = [
    {
        id: 'item-1',
        product: {
            product_name: 'Premium Leather Boots',
            stock_quantity: 10,
            product_images: [{ image_url: 'boots.jpg' }]
        },
        price: 1500,
        quantity: 2,
        variant: {
            variant_name: 'Size 10',
            stock_quantity: 5
        }
    }
];

const mockPromo = {
    promoDiscount: 100,
    promoCodeValid: true,
    promoCode: 'SAVE100'
};

const mockActions = {
    validateOrder: vi.fn(() => Promise.resolve(true)),
    loadCartItems: vi.fn(),
};

// Mock the checkout store hooks and actions
vi.mock('@/lib/stores/checkoutStore', () => ({
    useCheckoutCart: vi.fn(() => mockCartItems),
    useCheckoutPromo: vi.fn(() => mockPromo),
    useCheckoutActions: vi.fn(() => mockActions),
    useCheckoutErrors: vi.fn(() => ({})),
}));

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
    useToast: vi.fn(() => ({
        toast: vi.fn(),
    })),
}));

describe('CheckoutStep1', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders cart items correctly with premium styling', () => {
        render(<CheckoutStep1 />);

        expect(screen.getByText(/Order Items/i)).toBeInTheDocument();
        expect(screen.getByText(/Premium Leather Boots/i)).toBeInTheDocument();
        expect(screen.getByText(/R 3 000,00/i)).toBeInTheDocument();
    });

    it('triggers inventory update when clicking the button', () => {
        render(<CheckoutStep1 />);

        const updateButton = screen.getByText(/Update Inventory/i);
        fireEvent.click(updateButton);

        expect(mockActions.loadCartItems).toHaveBeenCalled();
    });

    it('navigates to shipping when "Shipping Details" is clicked and valid', async () => {
        // Mock window.location.href
        const originalLocation = window.location;
        delete (window as any).location;
        (window as any).location = { href: '' };

        render(<CheckoutStep1 />);

        const nextButton = screen.getByText(/Shipping Details/i);
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(window.location.href).toBe('/checkout/shipping');
        });

        (window as any).location = originalLocation;
    });
});
