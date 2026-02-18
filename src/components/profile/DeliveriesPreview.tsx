import { Package, Truck, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DeliveriesPreviewProps {
  deliveries: any[];
  conciergeEligible: boolean;
}

const statusIcon = (status: string) => {
  switch (status) {
    case "delivered": return <CheckCircle className="w-4 h-4 text-secondary" />;
    case "shipped":
    case "in_transit": return <Truck className="w-4 h-4 text-blue-400" />;
    default: return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const DeliveriesPreview = ({ deliveries, conciergeEligible }: DeliveriesPreviewProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/deliveries")}
      className="w-full mb-2 flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 hover:border-secondary/50 transition-all"
    >
      <div className="flex items-center gap-3">
        <Package className="w-5 h-5 text-muted-foreground" />
        <div className="text-left">
          <span className="text-foreground font-medium">My Deliveries</span>
          {deliveries.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {deliveries.filter(d => d.status !== "delivered").length} active
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {conciergeEligible && (
          <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full">Concierge</span>
        )}
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </button>
  );
};

export default DeliveriesPreview;
