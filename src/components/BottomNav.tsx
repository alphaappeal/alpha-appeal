import React, { forwardRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, MapPin, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Updated: Diary changed to Community with Users icon
const tabs = [
  { id: "shop", icon: ShoppingBag, label: "Shop", path: "/shop" },
  { id: "map", icon: MapPin, label: "Map", path: "/map" },
  { id: "community", icon: Users, label: "Community", path: "/community" },
  { id: "profile", icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = forwardRef<HTMLElement>((_, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50 safe-area-padding-bottom">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path || currentPath.startsWith(tab.path + "/");
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-300",
                isActive
                  ? "text-secondary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive && "bg-secondary/10"
              )}>
                <tab.icon className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 font-medium transition-all",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
BottomNav.displayName = "BottomNav";

export default BottomNav;