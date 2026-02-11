import React from 'react';
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  icon: string;
}

const steps: Step[] = [
  { number: 1, title: 'Review', icon: 'shopping_cart' },
  { number: 2, title: 'Shipping', icon: 'local_shipping' },
  { number: 3, title: 'Payment', icon: 'payments' },
  { number: 4, title: 'Confirm', icon: 'verified' }
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
  return (
    <div className={cn("flex flex-col items-center md:items-end", className)}>
      <div className="flex items-center gap-4">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isPending = step.number > currentStep;
          const isClickable = onStepClick && isCompleted;

          return (
            <React.Fragment key={step.number}>
              {/* Step Item */}
              <div
                className={cn(
                  "flex flex-col items-center gap-2 group relative",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => isClickable && onStepClick(step.number)}
              >
                {/* Icon Container */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border",
                  isCompleted ? "bg-primary border-primary text-white" : "",
                  isCurrent ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(107,142,107,0.3)]" : "",
                  isPending ? "bg-white/5 border-white/10 text-gray-500" : ""
                )}>
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-lg">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-lg">{step.icon}</span>
                  )}
                </div>

                {/* Step Title (Floating on desktop) */}
                <span className={cn(
                  "text-[10px] uppercase tracking-widest font-bold transition-colors",
                  isCompleted || isCurrent ? "text-primary" : "text-gray-500"
                )}>
                  {step.title}
                </span>

                {/* Status Dot for current */}
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background-dark animate-pulse" />
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-[1px] -mt-6",
                  step.number < currentStep ? "bg-primary" : "bg-white/10"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const CompactStepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const step = steps[currentStep - 1];

  return (
    <div className="flex items-center justify-between p-4 glass-panel border border-white/10 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">{step.icon}</span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Step {currentStep} of 4</p>
          <h3 className="font-display font-bold text-white uppercase tracking-wider">{step.title}</h3>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map(num => (
          <div
            key={num}
            className={cn(
              "h-1 rounded-full transition-all",
              num === currentStep ? "w-6 bg-primary" : "w-2 bg-white/10",
              num < currentStep ? "bg-primary/50" : ""
            )}
          />
        ))}
      </div>
    </div>
  );
};