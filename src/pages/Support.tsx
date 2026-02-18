import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Phone, Mail, Send, Loader2, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import logoLight from "@/assets/alpha-logo-light.png";

const Support = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [formData, setFormData] = useState({ subject: "", message: "" });

  useEffect(() => {
    const loadTickets = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setTickets(data || []);
    };
    loadTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return;
    setSending(true);

    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: session?.user?.id || null,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to submit ticket", variant: "destructive" });
    } else {
      toast({ title: "Ticket submitted", description: "We'll get back to you soon" });
      setFormData({ subject: "", message: "" });
      if (data) setTickets(prev => [data, ...prev]);
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
            <a href="tel:+27123456789" className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-secondary/50 transition-colors">
              <Phone className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-foreground font-medium">Helpline</p>
                <p className="text-muted-foreground text-sm">+27 12 345 6789</p>
              </div>
            </a>
            <a href="mailto:support@alphaappeal.co.za" className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-secondary/50 transition-colors">
              <Mail className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-foreground font-medium">Email</p>
                <p className="text-muted-foreground text-sm">support@alphaappeal.co.za</p>
              </div>
            </a>
          </div>

          {/* Submit Ticket Form */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
            <h2 className="font-display font-semibold text-foreground mb-4">Submit a Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                  maxLength={200}
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
                  maxLength={2000}
                  className="mt-2 bg-background min-h-[120px]"
                />
              </div>
              <Button type="submit" disabled={sending} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit Ticket
              </Button>
            </form>
          </div>

          {/* Previous Tickets */}
          {tickets.length > 0 && (
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
              <h2 className="font-display font-semibold text-foreground mb-4">Your Tickets</h2>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 rounded-xl border border-border/30 bg-card/20">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-foreground font-medium text-sm">{ticket.subject || "No subject"}</p>
                      <div className={`flex items-center gap-1 text-xs ${
                        ticket.status === "resolved" ? "text-secondary" : "text-muted-foreground"
                      }`}>
                        {ticket.status === "resolved" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span className="capitalize">{ticket.status || "open"}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ticket.message || "—"}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {ticket.created_at ? format(new Date(ticket.created_at), "MMM d, yyyy") : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Support;
