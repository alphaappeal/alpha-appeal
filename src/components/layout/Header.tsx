import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import alphaLogoDark from "@/assets/alpha-logo-dark.png";
import { cn } from "@/lib/utils";

const Header = () => {
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // TODO: Add auth state check
    const isAuthenticated = false;

    const navItems = [
        { name: "Shop", href: "/shop" },
        { name: "Membership", href: "/subscription" },
        { name: "About", href: "/about" },
        { name: "Journal", href: "/community" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/10">
            <div className="container mx-auto max-w-7xl px-6 lg:px-12">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-3xl">spa</span>
                            <h2 className="font-display text-2xl font-bold tracking-widest text-white uppercase">
                                Alpha
                            </h2>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-10">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "text-sm font-medium tracking-wide uppercase transition-colors",
                                    location.pathname === item.href
                                        ? "text-primary border-b border-primary/50"
                                        : "text-gray-300 hover:text-primary"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        {isSearchOpen ? (
                            <div className="hidden md:flex items-center animate-in fade-in slide-in-from-right-4">
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    className="w-64 h-10 bg-surface-dark border-border-dark"
                                    autoFocus
                                    onBlur={() => setIsSearchOpen(false)}
                                />
                                <button
                                    className="ml-2 text-gray-400 hover:text-white"
                                    onClick={() => setIsSearchOpen(false)}
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="hidden md:flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/5 transition-colors text-white"
                            >
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        )}

                        {/* Cart */}
                        <Link to="/cart">
                            <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/5 transition-colors text-white relative">
                                <span className="material-symbols-outlined">shopping_bag</span>
                                {/* TODO: Add cart count badge */}
                            </button>
                        </Link>

                        {/* Account */}
                        {isAuthenticated ? (
                            <Link to="/profile">
                                <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/5 transition-colors text-white">
                                    <span className="material-symbols-outlined">account_circle</span>
                                </button>
                            </Link>
                        ) : (
                            <Link to="/auth/login">
                                <button className="hidden md:flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/5 transition-colors text-white">
                                    <span className="material-symbols-outlined">account_circle</span>
                                </button>
                            </Link>
                        )}

                        {/* Mobile Menu */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/5 transition-colors text-white">
                                    <span className="material-symbols-outlined">menu</span>
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-background-dark border-border-dark">
                                <div className="flex flex-col gap-6 mt-8">
                                    <Link to="/" className="flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-primary text-3xl">spa</span>
                                        <h2 className="font-display text-xl font-bold tracking-widest text-white uppercase">
                                            Alpha
                                        </h2>
                                    </Link>
                                    <nav className="flex flex-col gap-4">
                                        {navItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                to={item.href}
                                                className={cn(
                                                    "text-lg font-medium transition-colors",
                                                    location.pathname === item.href
                                                        ? "text-primary"
                                                        : "text-gray-300 hover:text-primary"
                                                )}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
