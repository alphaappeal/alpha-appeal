import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const accountSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 18;
  }, "You must be 18 or older to join"),
});

const interests = [
  { id: "music", label: "Music & Sound" },
  { id: "fashion", label: "Fashion & Style" },
  { id: "wellness", label: "Wellness & Lifestyle" },
  { id: "events", label: "Events & Culture" },
  { id: "art", label: "Art & Design" },
  { id: "tech", label: "Tech & Innovation" },
];

interface SignupWizardProps {
  tier: string;
  isApplication?: boolean;
}

const SignupWizard = ({ tier, isApplication = false }: SignupWizardProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    dateOfBirth: "",
    interests: [] as string[],
    motivation: "",
  });

  const totalSteps = isApplication ? 3 : 2;
  const progress = (step / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const validateStep1 = () => {
    try {
      accountSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = async () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: formData.name,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("User already registered")) {
          toast({
            title: "Email already registered",
            description: "Please sign in or use a different email.",
            variant: "destructive",
          });
          return;
        }
        throw authError;
      }

      if (authData.user) {
        // Create user profile
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          date_of_birth: formData.dateOfBirth,
          subscription_tier: tier === "private" ? "pending" : tier,
        });

        if (userError) throw userError;

        // Save preferences
        await supabase.from("user_preferences").insert({
          user_id: authData.user.id,
          interests: formData.interests,
        });

        // If private application, save application
        if (isApplication) {
          await supabase.from("private_member_applications").insert({
            user_id: authData.user.id,
            motivation: formData.motivation,
            interests: formData.interests.join(", "),
          });
        }

        // Sync to MailerLite
        try {
          await supabase.functions.invoke("mailerlite-sync", {
            body: {
              email: formData.email,
              name: formData.name,
              tier: tier,
              userId: authData.user.id,
            },
          });
        } catch (mailError) {
          console.error("MailerLite sync error:", mailError);
          // Don't block signup if email sync fails
        }

        toast({
          title: isApplication ? "Application Submitted!" : "Account Created!",
          description: isApplication 
            ? "We'll review your application and get back to you soon." 
            : "Welcome to Alpha. Redirecting to payment...",
        });

        // Redirect based on tier
        if (tier === "free" || isApplication) {
          navigate("/welcome");
        } else {
          // Redirect to payment
          navigate(`/checkout?tier=${tier}`);
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step 1: Account */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Create Your Account
            </h2>
            <p className="text-muted-foreground">
              Join the Alpha movement in under 2 minutes
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>

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
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={errors.dateOfBirth ? "border-destructive" : ""}
              />
              {errors.dateOfBirth && <p className="text-destructive text-sm">{errors.dateOfBirth}</p>}
              <p className="text-xs text-muted-foreground">You must be 18+ to join Alpha</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preferences */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Your Interests
            </h2>
            <p className="text-muted-foreground">
              Help us personalize your experience
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {interests.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  formData.interests.includes(interest.id)
                    ? "bg-secondary/10 border-secondary text-foreground"
                    : "bg-card/50 border-border hover:border-secondary/50 text-muted-foreground"
                }`}
              >
                <span className="text-sm font-medium">{interest.label}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Select as many as you like (optional)
          </p>
        </div>
      )}

      {/* Step 3: Application (Private tier only) */}
      {step === 3 && isApplication && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Tell Us About Yourself
            </h2>
            <p className="text-muted-foreground">
              Why do you want to join the Private tier?
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivation">Your Motivation</Label>
              <textarea
                id="motivation"
                name="motivation"
                placeholder="Tell us what draws you to Alpha and what you hope to experience..."
                value={formData.motivation}
                onChange={handleInputChange}
                className="w-full h-32 px-4 py-3 rounded-xl bg-card border border-border focus:border-secondary focus:ring-1 focus:ring-secondary outline-none resize-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <Button variant="glass" onClick={handleBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <Button
          variant="sage"
          onClick={handleNext}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : step === totalSteps ? (
            isApplication ? "Submit Application" : "Continue to Payment"
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SignupWizard;
