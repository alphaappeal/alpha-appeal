import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimedPopupProps {
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const TimedPopup = ({ title, message, duration = 10, onClose }: TimedPopupProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration * 1000);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md mx-4 shadow-luxury animate-scale-in">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mt-1 -mr-2">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{message}</p>
        <Button variant="secondary" size="sm" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
};

export default TimedPopup;