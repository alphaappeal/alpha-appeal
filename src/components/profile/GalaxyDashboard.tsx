import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, Palette, Heart, Car, Shirt,
  ChevronRight, ChevronLeft, Star, X, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SolarSystem {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  items: any[];
}

interface GalaxyDashboardProps {
  starredStrains: any[];
  starredArt: any[];
  starredCulture: any[];
  starredCultureItems: { fashion: any[]; wellness: any[]; cars: any[]; artwork: any[] };
  userId?: string;
  onUnstar?: () => void;
}

const GalaxyDashboard = ({
  starredStrains,
  starredArt,
  starredCulture,
  starredCultureItems,
  userId,
  onUnstar,
}: GalaxyDashboardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSystem, setActiveSystem] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const systems: SolarSystem[] = [
    {
      key: "strains",
      label: "Strains",
      icon: Leaf,
      color: "text-secondary",
      glowColor: "shadow-[0_0_20px_hsl(103_22%_56%/0.4)]",
      items: starredStrains,
    },
    {
      key: "wellness",
      label: "Wellness",
      icon: Heart,
      color: "text-rose-400",
      glowColor: "shadow-[0_0_20px_hsl(350_80%_60%/0.4)]",
      items: starredCultureItems.wellness,
    },
    {
      key: "cars",
      label: "Cars",
      icon: Car,
      color: "text-sky-400",
      glowColor: "shadow-[0_0_20px_hsl(200_80%_60%/0.4)]",
      items: starredCultureItems.cars,
    },
    {
      key: "fashion",
      label: "Fashion",
      icon: Shirt,
      color: "text-amber-400",
      glowColor: "shadow-[0_0_20px_hsl(40_80%_60%/0.4)]",
      items: starredCultureItems.fashion,
    },
    {
      key: "artwork",
      label: "Artwork",
      icon: Palette,
      color: "text-violet-400",
      glowColor: "shadow-[0_0_20px_hsl(270_80%_60%/0.4)]",
      items: [...starredArt, ...starredCultureItems.artwork],
    },
  ];

  const totalStarred = systems.reduce((sum, s) => sum + s.items.length, 0) + starredCulture.length;
  const activeData = systems.find((s) => s.key === activeSystem);

  const handleUnstar = useCallback(
    async (system: string, itemId: string) => {
      if (!userId) return;
      if (system === "strains") {
        await supabase
          .from("post_interactions")
          .delete()
          .eq("user_id", userId)
          .eq("strain_id", itemId)
          .eq("interaction_type", "star");
      } else if (system === "artwork" && starredArt.some((a) => a.id === itemId)) {
        await supabase
          .from("art_interactions")
          .delete()
          .eq("user_id", userId)
          .eq("post_id", itemId)
          .eq("interaction_type", "star");
      } else {
        await supabase
          .from("post_interactions")
          .delete()
          .eq("user_id", userId)
          .eq("culture_item_id", itemId)
          .eq("interaction_type", "star");
      }
      toast({ title: "Unstarred", description: "Removed from your Galaxy." });
      onUnstar?.();
    },
    [userId, starredArt, toast, onUnstar]
  );

  const getItemName = (item: any) => item.name || item.title || "Untitled";
  const getItemSub = (system: string, item: any) => {
    if (system === "strains") return item.type || "Hybrid";
    if (system === "artwork") return item.artist_name || item.creator || "";
    return item.creator || item.type || "";
  };

  const handleItemClick = (system: string, item: any) => {
    if (system === "strains") navigate(`/strain/${item.slug || item.id}`);
    else if (system === "artwork" || system === "fashion" || system === "wellness" || system === "cars")
      navigate(`/culture/${item.slug || item.id}`);
  };

  // Galaxy trigger button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mb-8 group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-6 transition-all hover:border-secondary/40"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(103_22%_56%/0.08)_0%,_transparent_70%)] pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 group-hover:shadow-[0_0_24px_hsl(103_22%_56%/0.3)] transition-shadow">
              <Sparkles className="w-6 h-6 text-secondary" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                {totalStarred}
              </span>
            </div>
            <div className="text-left">
              <h3 className="font-display font-semibold text-foreground text-base">
                My Galaxy
              </h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                {totalStarred} starred across {systems.filter((s) => s.items.length > 0).length} solar systems
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
        </div>

        {/* Mini orbit indicators */}
        <div className="flex gap-2 mt-4">
          {systems.map((sys) => (
            <div
              key={sys.key}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/30 bg-card/40 ${
                sys.items.length > 0 ? "opacity-100" : "opacity-40"
              }`}
            >
              <sys.icon className={`w-3 h-3 ${sys.color}`} />
              <span className="text-[10px] text-muted-foreground font-medium">
                {sys.items.length}
              </span>
            </div>
          ))}
        </div>
      </button>
    );
  }

  // Expanded Galaxy view
  return (
    <div className="mb-8 rounded-2xl border border-border/50 bg-card/20 overflow-hidden relative">
      {/* Galaxy background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(103_22%_56%/0.06)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_hsl(270_80%_60%/0.04)_0%,_transparent_50%)] pointer-events-none" />

      {/* Header / breadcrumb */}
      <div className="relative flex items-center gap-2 px-5 py-4 border-b border-border/30">
        {activeSystem ? (
          <button
            onClick={() => setActiveSystem(null)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-medium">Galaxy</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="font-display font-semibold text-foreground text-sm">My Galaxy</span>
          </div>
        )}
        {activeSystem && activeData && (
          <>
            <span className="text-muted-foreground text-xs">/</span>
            <div className="flex items-center gap-1.5">
              <activeData.icon className={`w-3.5 h-3.5 ${activeData.color}`} />
              <span className="text-foreground text-xs font-semibold">{activeData.label}</span>
            </div>
          </>
        )}
        <button
          onClick={() => {
            setIsOpen(false);
            setActiveSystem(null);
          }}
          className="ml-auto p-1 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation bar */}
      {!activeSystem && (
        <div className="relative px-3 py-2 border-b border-border/20 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 min-w-max">
            {systems.map((sys) => (
              <button
                key={sys.key}
                onClick={() => sys.items.length > 0 && setActiveSystem(sys.key)}
                disabled={sys.items.length === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sys.items.length > 0
                    ? "hover:bg-muted/50 text-foreground cursor-pointer"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                <sys.icon className={`w-3.5 h-3.5 ${sys.items.length > 0 ? sys.color : ""}`} />
                <span>{sys.label}</span>
                <span className="text-[10px] text-muted-foreground ml-0.5">({sys.items.length})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!activeSystem ? (
          /* Solar System overview tiles */
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative p-4 grid grid-cols-2 gap-3"
          >
            {systems.map((sys) => (
              <button
                key={sys.key}
                onClick={() => sys.items.length > 0 && setActiveSystem(sys.key)}
                disabled={sys.items.length === 0}
                className={`group relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border transition-all ${
                  sys.items.length > 0
                    ? `border-border/40 bg-card/30 hover:bg-card/50 hover:${sys.glowColor} cursor-pointer`
                    : "border-border/20 bg-card/10 opacity-40 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center bg-card/60 border border-border/30 ${
                    sys.items.length > 0 ? `group-hover:${sys.glowColor}` : ""
                  } transition-shadow`}
                >
                  <sys.icon className={`w-5 h-5 ${sys.color}`} />
                </div>
                <span className="text-foreground text-xs font-semibold">{sys.label}</span>
                <span className="text-[10px] text-muted-foreground">{sys.items.length} starred</span>
              </button>
            ))}
          </motion.div>
        ) : (
          /* Solar System detail view */
          <motion.div
            key={activeSystem}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative p-4 space-y-2"
          >
            {activeData && activeData.items.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">No starred items yet.</p>
            )}
            {activeData?.items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-card/20 hover:border-secondary/30 transition-all group"
              >
                <button
                  onClick={() => handleItemClick(activeSystem, item)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  {item.img_url || item.image_url ? (
                    <img
                      src={item.img_url || item.image_url}
                      alt={getItemName(item)}
                      loading="lazy"
                      className="w-10 h-10 rounded-lg object-cover border border-border/20 flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-card/50 border border-border/20 flex-shrink-0`}>
                      {activeData && <activeData.icon className={`w-4 h-4 ${activeData.color}`} />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-medium truncate">{getItemName(item)}</p>
                    <p className="text-muted-foreground text-xs truncate">{getItemSub(activeSystem, item)}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnstar(activeSystem, item.id);
                    }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                    title="Unstar"
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalaxyDashboard;
