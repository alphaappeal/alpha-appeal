import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useCheckoutStore, useCheckoutStep, useCheckoutCart, useCheckoutActions } from '@/lib/stores/checkoutStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { StepIndicator } from '@/components/checkout/StepIndicator';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { CheckoutStep1 } from '@/components/checkout/CheckoutStep1';
import { CheckoutStep2 } from '@/components/checkout/CheckoutStep2';
import { CheckoutStep3 } from '@/components/checkout/CheckoutStep3';
import { CheckoutStep4 } from '@/components/checkout/CheckoutStep4';

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
  const CurrentStepComponent = currentStepData.component;

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
    // This would open the cart drawer or navigate to cart page
    // For now, we'll navigate to shop
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={currentStep > 1 ? handlePreviousStep : handleStartOver}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep > 1 ? 'Back' : 'Start Over'}
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h1>
                <p className="text-sm text-gray-600">{currentStepData.description}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Step Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderStepContent()}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <OrderSummary onEditCart={handleEditCart} />
            </div>
          )}
        </div>

        {/* Mobile Order Summary */}
        {isMobile && (
          <div className="mt-6">
            <OrderSummary isMobile onEditCart={handleEditCart} />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className="flex-1 mr-2"
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNextStep}
                  disabled={currentStep === 4}
                  className="flex-1 ml-2 bg-green-600 hover:bg-green-700"
                >
                  {currentStep === 4 ? 'Complete Order' : 'Continue'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Checkout Layout for consistent styling
export const CheckoutLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {children}
          </div>
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};