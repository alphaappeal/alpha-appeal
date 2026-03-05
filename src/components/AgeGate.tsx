import React, { useState, useEffect, forwardRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const AgeGate = forwardRef<HTMLDivElement>((_, ref) => {
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    const ageConfirmed = localStorage.getItem('alphaAppeal_ageConfirmed');
    const confirmationDate = localStorage.getItem('alphaAppeal_ageConfirmDate');
    
    if (!ageConfirmed || !confirmationDate) {
      setShowGate(true);
    } else {
      const daysSinceConfirm = (Date.now() - parseInt(confirmationDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceConfirm > 30) {
        setShowGate(true);
      }
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('alphaAppeal_ageConfirmed', 'true');
    localStorage.setItem('alphaAppeal_ageConfirmDate', Date.now().toString());
    setShowGate(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!showGate) return null;

  return (
    <div ref={ref} className="fixed inset-0 z-[9999] bg-background/98 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-card border border-border rounded-2xl p-8 shadow-2xl animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Alpha Appeal
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Premium Lifestyle & Cannabis Information
          </p>
        </div>

        {/* Age Verification Message */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Age Verification Required
          </h2>
          <p className="text-muted-foreground text-sm mb-3">
            This website contains cannabis-related information intended for adults only.
          </p>
          <p className="text-muted-foreground text-sm">
            By entering, you confirm that you are at least 21 years of age or the legal age in your jurisdiction to view cannabis information.
          </p>
        </div>

        {/* Legal Disclaimers */}
        <div className="bg-muted/30 rounded-xl p-4 mb-6">
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>This site is for informational and educational purposes only</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>Content is not medical advice and should not replace professional consultation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>We do not sell cannabis or facilitate transactions</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>You are responsible for complying with local laws</span>
            </div>
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link to="/legal#terms" className="text-secondary hover:underline">
              Terms & Conditions
            </Link>
            {' '}and{' '}
            <Link to="/legal#privacy" className="text-secondary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/90 transition-all"
          >
            I am 21+ and agree to Terms
          </button>
          
          <button
            onClick={handleExit}
            className="w-full py-3 bg-muted text-muted-foreground font-medium rounded-xl hover:bg-muted/80 transition-all"
          >
            I am under 21 - Exit Site
          </button>
        </div>

        {/* Footer Warning */}
        <p className="text-center text-xs text-destructive/80 mt-6">
          ⚠️ Providing false information may violate local laws
        </p>
      </div>
    </div>
  );
});
AgeGate.displayName = "AgeGate";

export default AgeGate;
