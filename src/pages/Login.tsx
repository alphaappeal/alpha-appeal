import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Eye, EyeOff, Loader2, Store, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logoLight from "@/assets/alpha-logo-light.png";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if already logged in - redirect to profile (not welcome)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/profile");
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/profile");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email not verified",
            description: "Please check your email and verify your account.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.session) {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        // Redirect to profile, not welcome
        navigate("/profile");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Alpha</title>
        <meta name="description" content="Sign in to your Alpha account." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-6">
          <div className="container mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-8" />
            </Link>
            <div className="w-16" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 pb-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to continue your Alpha journey
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-destructive" : ""}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </div>

            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-secondary hover:underline">
                  Join Alpha
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Forgot your password?{" "}
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.email.trim()) {
                      toast({ title: "Enter your email", description: "Please enter your email address first.", variant: "destructive" });
                      return;
                    }
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
                        redirectTo: `${window.location.origin}/reset-password`,
                      });
                      if (error) throw error;
                      toast({ title: "Reset link sent", description: "Check your email for a password reset link." });
                    } catch (err: any) {
                      toast({ title: "Error", description: err.message || "Failed to send reset link.", variant: "destructive" });
                    }
                  }}
                  className="text-secondary hover:underline"
                >
                  Reset it
                </button>
              </p>
              <div className="pt-6 mt-6 border-t border-border/30">
                <div className="bg-gradient-to-br from-secondary/5 via-card to-secondary/5 rounded-xl p-5 border border-secondary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">For Vendors</p>
                      <p className="text-xs text-muted-foreground">Manage your Alpha partner store</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Are you a cannabis retailer or wellness provider? Join our network and access thousands of engaged members.
                  </p>
                  <Link 
                    to="/vendor/signup" 
                    className="inline-flex items-center justify-center w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm"
                  >
                    <Store className="w-4 h-4" />
                    Become a Vendor
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Login;