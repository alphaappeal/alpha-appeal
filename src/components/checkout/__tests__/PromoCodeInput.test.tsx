import { render, screen, fireEvent } from '@testing-library/react';
import { PromoCodeInput } from '../PromoCodeInput';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Stable mocks
const mockPromo = {
    promoCode: '',
    promoCodeValid: false,
    promoDiscount: 0
};

const mockActions = {
    setPromoCode: vi.fn(),
    clearPromoCode: vi.fn(),
};

// Mock the checkout store hooks and actions
vi.mock('@/lib/stores/checkoutStore', () => ({
    useCheckoutPromo: vi.fn(() => mockPromo),
    useCheckoutActions: vi.fn(() => mockActions),
}));

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
    useToast: vi.fn(() => ({
        toast: vi.fn(),
    })),
}));

describe('PromoCodeInput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPromo.promoCode = '';
        mockPromo.promoCodeValid = false;
        mockPromo.promoDiscount = 0;
    });

    it('renders correctly', () => {
        render(<PromoCodeInput />);
        expect(screen.getByText(/Privilege Certificates/i)).toBeInTheDocument();
    });

    it('triggers authentication when valid code is entered', async () => {
        render(<PromoCodeInput />);

        const input = screen.getByPlaceholderText(/Promotion Identifier/i);
        fireEvent.change(input, { target: { value: 'WELCOME10' } });

        const authButton = screen.getByText(/Authenticate/i);
        fireEvent.click(authButton);

        expect(mockActions.setPromoCode).toHaveBeenCalledWith('WELCOME10');
    });

    it('shows active state correctly', () => {
        mockPromo.promoCode = 'ALPHA2026';
        mockPromo.promoCodeValid = true;
        mockPromo.promoDiscount = 250.50;

        render(<PromoCodeInput />);

        expect(screen.getByText(/Active Certificate/i)).toBeInTheDocument();
        expect(screen.getByText(/ALPHA2026/i)).toBeInTheDocument();
    });
});
