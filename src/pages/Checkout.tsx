import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useCheckoutStore, useCheckoutStep, useCheckoutCart, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { StepIndicator } from '@/components/checkout/StepIndicator';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { CheckoutStep1 } from '@/components/checkout/CheckoutStep1';
import { CheckoutStep2 } from '@/components/checkout/CheckoutStep2';
import { CheckoutStep3 } from '@/components/checkout/CheckoutStep3';
import { CheckoutStep4 } from '@/components/checkout/CheckoutStep4';
import { Helmet } from "react-helmet-async";

interface CheckoutStep {
  path: string;
  component: React.ComponentType;
  title: string;
  description: string;
}

const checkoutSteps: CheckoutStep[] = [
  {
    path: 'review',
    component: CheckoutStep1,
    title: 'Review Your Order',
    description: 'Confirm items and quantities before proceeding'
  },
  {
    path: 'shipping',
    component: CheckoutStep2,
    title: 'Shipping Information',
    description: 'Provide delivery and billing addresses'
  },
  {
    path: 'payment',
    component: CheckoutStep3,
    title: 'Payment Method',
    description: 'Choose how you want to pay for your order'
  },
  {
    path: 'confirmation',
    component: CheckoutStep4,
    title: 'Order Confirmation',
    description: 'Review final details and complete your purchase'
  }
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step: stepParam } = useParams();
  const { toast } = useToast();

  const currentStep = useCheckoutStep();
  const cartItems = useCheckoutCart();
  const { loadCartItems, resetCheckout } = useCheckoutActions();

  const [isMobile, setIsMobile] = useState(false);

  // Check if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add some items before proceeding to checkout.",
        variant: "destructive",
      });
      navigate('/shop');
      return;
    }
  }, [cartItems.length, navigate, toast]);

  // Load cart items on mount
  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  // Handle step navigation
  useEffect(() => {
    const currentPath = stepParam || 'review';
    const stepIndex = checkoutSteps.findIndex(step => step.path === currentPath);

    if (stepIndex === -1) {
      // Invalid step, redirect to review
      navigate('/checkout/review', { replace: true });
      return;
    }

    // Update store step if different
    if (stepIndex + 1 !== currentStep) {
      useCheckoutStore.getState().setCurrentStep((stepIndex + 1) as 1 | 2 | 3 | 4);
    }
  }, [stepParam, currentStep, navigate]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = location.pathname.split('/').pop() || 'review';
      const stepIndex = checkoutSteps.findIndex(step => step.path === currentPath);

      if (stepIndex !== -1) {
        useCheckoutStore.getState().setCurrentStep((stepIndex + 1) as 1 | 2 | 3 | 4);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get current step data
  const currentStepData = checkoutSteps[currentStep - 1];

  // Navigation handlers
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      const prevStep = checkoutSteps[currentStep - 2];
      navigate(`/checkout/${prevStep.path}`);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      const nextStep = checkoutSteps[currentStep];
      navigate(`/checkout/${nextStep.path}`);
    }
  };

  const handleStartOver = () => {
    resetCheckout();
    navigate('/shop');
  };

  const handleEditCart = () => {
    navigate('/shop');
  };

  // Render step content
  const renderStepContent = () => {
    if (currentStep === 1) {
      return <CheckoutStep1 />;
    } else if (currentStep === 2) {
      return <CheckoutStep2 />;
    } else if (currentStep === 3) {
      return <CheckoutStep3 />;
    } else if (currentStep === 4) {
      return <CheckoutStep4 />;
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Checkout | Alpha Appeal</title>
      </Helmet>

      <div className="min-h-screen bg-background-dark pt-12 pb-24">
        {/* Header Section */}
        <div className="container mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={currentStep > 1 ? handlePreviousStep : handleStartOver}
                  className="flex items-center text-gray-400 hover:text-white transition-colors group"
                >
                  <span className="material-symbols-outlined text-sm mr-1 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span className="text-xs uppercase tracking-widest font-bold">{currentStep > 1 ? 'Back' : 'Start Over'}</span>
                </button>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-gray-400">
                {currentStepData.description}
              </p>
            </div>

            <div className="hidden md:block">
              <StepIndicator
                currentStep={currentStep}
                onStepClick={(step) => {
                  if (step < currentStep) {
                    const targetStep = checkoutSteps[step - 1];
                    navigate(`/checkout/${targetStep.path}`);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Step Content */}
            <div className="lg:col-span-2">
              <div className="glass-panel rounded-2xl p-8 border border-white/5">
                {renderStepContent()}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <OrderSummary onEditCart={handleEditCart} />
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 glass-nav border-t border-white/10 p-4 z-50">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className="flex-1 bg-transparent border-white/10 text-white"
                >
                  Previous
                </Button>

                <Button
                  onClick={handleNextStep}
                  disabled={currentStep === 4}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold"
                >
                  {currentStep === 4 ? 'Complete Order' : 'Continue'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Checkout Layout for consistent styling
export const CheckoutLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-dark pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-2xl p-8 border border-white/5">
              {children}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;