
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import alphaLogoLight from "@/assets/alpha-logo-light.png";
import alphaLogoDark from "@/assets/alpha-logo-dark.png";
import { cn } from "@/lib/utils";

const Header = () => {
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // TODO: Add auth state check
    const isAuthenticated = false;

    const navItems = [
        { name: "Shop", href: "/shop" },
        { name: "Subscription", href: "/subscription" },
        { name: "Music", href: "/music" },
        { name: "NFTs", href: "/nfts" },
        { name: "Learn", href: "/learn" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="md:hidden" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <div className="flex flex-col gap-6 mt-8">
                            <Link to="/" className="flex items-center gap-2">
                                <img src={alphaLogoLight} alt="Alpha Appeal" className="h-8 w-auto dark:hidden" />
                                <img src={alphaLogoDark} alt="Alpha Appeal" className="h-8 w-auto hidden dark:block" />
                            </Link>
                            <nav className="flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={cn(
                                            "text-lg font-medium transition-colors hover:text-primary",
                                            location.pathname === item.href
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={alphaLogoLight} alt="Alpha Appeal" className="h-8 w-auto dark:hidden" />
                        <img src={alphaLogoDark} alt="Alpha Appeal" className="h-8 w-auto hidden dark:block" />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                location.pathname === item.href
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isSearchOpen ? (
                        <div className="hidden md:flex items-center animate-in fade-in slide-in-from-right-4">
                            <Input
                                type="search"
                                placeholder="Search products..."
                                className="w-64 h-9"
                                autoFocus
                                onBlur={() => setIsSearchOpen(false)}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-1"
                                onClick={() => setIsSearchOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex"
                        >
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Search</span>
                        </Button>
                    )}

                    <Link to="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="sr-only">Cart</span>
                            {/* TODO: Add cart count badge */}
                        </Button>
                    </Link>

                    {isAuthenticated ? (
                        <Link to="/profile">
                            <Button variant="ghost" size="icon">
                                <User className="h-5 w-5" />
                                <span className="sr-only">Profile</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link to="/auth">
                            <Button variant="default" size="sm" className="hidden md:flex">
                                Sign In
                            </Button>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <User className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
