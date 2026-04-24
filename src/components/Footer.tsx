import { useState, useEffect } from "react";
import { Instagram, Twitter, Youtube, Download, Share, X } from "lucide-react";
import alphaLogo from "@/assets/alpha-logo-light.png";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIos = () => {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && (navigator as any).standalone === true);

const Footer = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    if (isIos()) {
      setCanShow(true);
    } else {
      const handler = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
        setCanShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const handleInstall = async () => {
    if (isIos()) {
      setShowIosGuide(true);
      return;
    }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setCanShow(false);
    }
  };

  return (
    <footer className="bg-card/80 border-t border-border/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img 
              src={alphaLogo} 
              alt="Alpha Appeal" 
              className="h-8 w-auto mb-6"
            />
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              The premier cannabis lifestyle subscription. 
              Curated products, premium experiences.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Membership</h4>
            <ul className="space-y-3">
              <li><a href="#tiers" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Essential Tier</a></li>
              <li><a href="#tiers" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Elite Tier</a></li>
              <li><a href="#tiers" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Private Tier</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Gift a Membership</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#philosophy" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Our Story</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Press</a></li>
              <li><a href="/vendor/signup" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Become a Vendor</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="/legal#terms" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Terms & Conditions</a></li>
              <li><a href="/legal#privacy" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="/legal#disclaimer" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Disclaimers</a></li>
              <li><a href="/legal#contact" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Contact Legal</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Alpha Appeal. All rights reserved.
            </p>
            <div className="flex items-center gap-6 flex-wrap justify-center md:justify-end">
              {canShow && (
                <div className="relative">
                  <button
                    onClick={handleInstall}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Install App
                  </button>
                  {showIosGuide && (
                    <div className="absolute bottom-full mb-3 right-0 w-72 p-4 rounded-xl bg-popover border border-border shadow-lg z-50">
                      <button
                        onClick={() => setShowIosGuide(false)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-sm font-semibold text-foreground mb-2">Install Alpha Appeal</p>
                      <ol className="text-xs text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="font-semibold text-foreground">1.</span>
                          <span>Tap the <Share className="w-3.5 h-3.5 inline -mt-0.5" /> Share button in your browser toolbar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-semibold text-foreground">2.</span>
                          <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-semibold text-foreground">3.</span>
                          <span>Tap <strong>"Add"</strong> to confirm</span>
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
              <span className="text-muted-foreground text-sm">
                🇿🇦 Made in South Africa
              </span>
              <span className="text-destructive/80 text-xs px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10">
                21+ Only
              </span>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-border/20">
            <p className="text-muted-foreground/60 text-xs">
              ⚠️ For Educational Purposes Only | Not Medical Advice | Cannabis laws vary by jurisdiction
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
