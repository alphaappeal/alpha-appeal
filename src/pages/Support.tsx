import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Phone, Mail, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logoLight from "@/assets/alpha-logo-light.png";

const Support = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase
      .from("support_requests")
      .insert({
        user_id: session?.user?.id || null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

    if (error) {
      toast({ title: "Error", description: "Failed to submit request", variant: "destructive" });
    } else {
      toast({ title: "Request submitted", description: "We'll get back to you soon" });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    setSending(false);
  };

  return (
    <>
      <Helmet>
        <title>Help & Support | Alpha</title>
        <meta name="description" content="Get help and support from the Alpha team." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/profile")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">Support</h1>
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-6" />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Contact Info */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-4">
            <h2 className="font-display font-semibold text-foreground">Contact Us</h2>
            
            <a
              href="tel:+27123456789"
              className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-secondary/50 transition-colors"
            >
              <Phone className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-foreground font-medium">Helpline</p>
                <p className="text-muted-foreground text-sm">+27 12 345 6789</p>
              </div>
            </a>

            <a
              href="mailto:support@alphaappeal.co.za"
              className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-secondary/50 transition-colors"
            >
              <Mail className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-foreground font-medium">Email</p>
                <p className="text-muted-foreground text-sm">support@alphaappeal.co.za</p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
            <h2 className="font-display font-semibold text-foreground mb-4">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  required
                  className="mt-2 bg-background"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="mt-2 bg-background"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                  required
                  className="mt-2 bg-background"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more..."
                  required
                  className="mt-2 bg-background min-h-[120px]"
                />
              </div>

              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Request
              </Button>
            </form>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Support;