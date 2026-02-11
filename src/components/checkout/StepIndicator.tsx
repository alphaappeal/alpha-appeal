import React from 'react';
import { CheckCircle, Circle, Clock, Truck, CreditCard, BadgeCheck } from 'lucide-react';
import { useCheckoutStep } from '@/lib/stores/checkoutStore';

interface Step {
  number: number;
  title: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { number: 1, title: 'Review Cart', icon: <CheckCircle className="w-4 h-4" /> },
  { number: 2, title: 'Shipping Info', icon: <Truck className="w-4 h-4" /> },
  { number: 3, title: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
  { number: 4, title: 'Confirmation', icon: <BadgeCheck className="w-4 h-4" /> }
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  onStepClick,
  className = '' 
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'current': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-400 bg-gray-100 border-gray-200';
    }
  };

  const getStepIcon = (step: Step, status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return step.icon;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isClickable = onStepClick && step.number < currentStep;
          
          return (
            <React.Fragment key={step.number}>
              {/* Step */}
              <div 
                className={`
                  flex flex-col items-center flex-1 group cursor-pointer
                  ${isClickable ? 'hover:scale-105 transition-transform' : ''}
                `}
                onClick={() => isClickable && onStepClick(step.number)}
              >
                {/* Step Circle */}
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 shadow-sm
                  ${getStepColor(status)}
                  ${isClickable ? 'hover:shadow-md' : ''}
                `}>
                  {getStepIcon(step, status)}
                </div>

                {/* Step Title */}
                <span className={`
                  mt-2 text-xs font-medium text-center transition-colors
                  ${status === 'completed' ? 'text-green-600' : ''}
                  ${status === 'current' ? 'text-blue-600 font-semibold' : ''}
                  ${status === 'pending' ? 'text-gray-500' : ''}
                `}>
                  {step.title}
                </span>

                {/* Step Number (for current step) */}
                {status === 'current' && (
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                )}
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className={`
                    h-0.5 w-full transition-colors duration-300
                    ${step.number < currentStep ? 'bg-green-300' : 'bg-gray-200'}
                  `} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Description */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
        </p>
        <div className="mt-1 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Estimated time: {5 + (currentStep * 2)} minutes</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Compact version for mobile
export const CompactStepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const step = steps[currentStep - 1];
  
  return (
    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-100 border-2 border-blue-200 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">Step {currentStep}</span>
          <span className="text-xs text-gray-600">{step.title}</span>
        </div>
      </div>
      
      <div className="ml-auto text-xs text-gray-500">
        {currentStep} of {steps.length}
      </div>
    </div>
  );
};