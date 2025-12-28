import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Settings } from "lucide-react";

const CONSENT_KEY = "alpha_consent_given";

const ConsentModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem(CONSENT_KEY);
    if (!hasConsent) {
      // Small delay for better UX
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    localStorage.setItem("alpha_data_optimization", "true");
    setOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    localStorage.setItem("alpha_data_optimization", "false");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <DialogTitle className="font-display text-xl">Welcome to Alpha</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-base leading-relaxed">
            To make Alpha faster and more personal, we use anonymised usage data with trusted optimisation partners. 
            Your privacy matters to us.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                You can change your preferences anytime in{" "}
                <span className="text-foreground">Profile → Settings</span>.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="glass" onClick={handleDecline} className="flex-1">
            No Thanks
          </Button>
          <Button variant="sage" onClick={handleAccept} className="flex-1">
            Accept & Continue
          </Button>
        </DialogFooter>

        <div className="text-center pt-2">
          <a 
            href="/terms" 
            className="text-xs text-muted-foreground hover:text-secondary transition-colors underline"
          >
            Read our full Terms & Conditions
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentModal;
