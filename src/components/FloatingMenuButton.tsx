import { useState, useRef, useEffect, ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingMenuButtonProps {
  children: ReactNode;
}

interface MenuItemProps {
  children: ReactNode;
  onClick: () => void;
}

export const MenuItem = ({ children, onClick }: MenuItemProps) => (
  <button
    onClick={onClick}
    className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary/10 transition-colors border-b border-border/30 last:border-0 first:rounded-t-xl last:rounded-b-xl"
  >
    {children}
  </button>
);

const FloatingMenuButton = ({ children }: FloatingMenuButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="fixed top-20 right-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-3 rounded-full shadow-lg transition-all duration-300",
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
          "border border-secondary/30",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="absolute top-14 right-0 bg-card border border-border rounded-xl shadow-luxury min-w-[200px] animate-scale-in overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};

export default FloatingMenuButton;