import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff, Gift } from "lucide-react";
import { z } from "zod";
import PromoCodeInput from "./PromoCodeInput";

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
  const [searchParams] = useSearchParams();
  const showPromo = searchParams.get("promo") === "true";
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validPromoCode, setValidPromoCode] = useState<string | null>(null);
  const [usePromoCode, setUsePromoCode] = useState(showPromo);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    dateOfBirth: "",
    interests: [] as string[],
    motivation: "",
    referralCode: "",
  });
  const [referralStatus, setReferralStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [referralMessage, setReferralMessage] = useState("");

  const totalSteps = isApplication ? 3 : 2;

  const checkReferralCode = async () => {
    if (!formData.referralCode.trim()) return;
    setReferralStatus("checking");
    try {
      const { data, error } = await supabase.rpc("validate_referral_code", {
        code_input: formData.referralCode.trim(),
      });
      if (error) throw error;
      const result = data as any;
      if (result?.valid) {
        setReferralStatus("valid");
        setReferralMessage(result.referrer_name ? `Referred by ${result.referrer_name}` : "Code applied!");
      } else {
        setReferralStatus("invalid");
        setReferralMessage(result?.message || "Invalid code");
      }
    } catch {
      setReferralStatus("invalid");
      setReferralMessage("Could not validate code");
    }
  };
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
      
      // Determine final tier
      const finalTier = validPromoCode ? "promo" : tier;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.name,
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
        // Determine subscription_tier and application_status for profiles
        let subscriptionTier = finalTier;
        let applicationStatus = "none";
        if (isApplication) {
          subscriptionTier = "pending_private";
          applicationStatus = "submitted";
        }

        // Update user profile
        const { error: userError } = await supabase.from("users").upsert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.name,
          dob: formData.dateOfBirth,
          tier: isApplication ? "pending" : finalTier,
        }, { onConflict: "id" });

        if (userError) {
          console.error("User profile upsert error:", userError.code, userError.message, userError.details);
          throw userError;
        }

        // Sync profiles table with new columns
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.name,
          subscription_tier: subscriptionTier,
          payment_status: validPromoCode ? "paid" : "pending",
          referral_code_used: referralStatus === "valid" ? formData.referralCode.trim().toUpperCase() : null,
          application_status: applicationStatus,
        }, { onConflict: "id" });

        // Update preferences
        const { error: prefError } = await supabase.from("user_preferences").upsert({
          user_id: authData.user.id,
          interests: formData.interests,
        }, { onConflict: "user_id" });

        if (prefError) {
          console.error("Preferences upsert error:", prefError.code, prefError.message);
        }

        // If using promo code, record redemption
        if (validPromoCode) {
          await supabase.from("promo_code_redemptions").insert({
            user_id: authData.user.id,
            promo_code: validPromoCode,
          });
        }

        // If referral code was valid, record it
        if (referralStatus === "valid" && formData.referralCode.trim()) {
          const { data: refCode } = await supabase
            .from("referral_codes")
            .select("user_id")
            .eq("code", formData.referralCode.trim().toUpperCase())
            .eq("active", true)
            .maybeSingle();
          
          if (refCode) {
            await supabase.from("referrals").insert({
              referrer_id: refCode.user_id,
              referred_id: authData.user.id,
              code_used: formData.referralCode.trim().toUpperCase(),
            });
          }
        }

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
              tier: finalTier,
              userId: authData.user.id,
            },
          });
        } catch (mailError) {
          console.error("MailerLite sync error:", mailError);
        }

        toast({
          title: isApplication ? "Application Submitted!" : "Welcome to Alpha!",
          description: isApplication 
            ? "We'll review your application and get back to you soon." 
            : validPromoCode 
              ? "Your promo code was applied. Enjoy your access!"
              : "Redirecting to payment...",
        });

        // Redirect based on tier and promo
        if (validPromoCode || isApplication) {
          // Promo users go straight to profile/app
          navigate("/profile");
        } else {
          // Paid tiers go to checkout
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

          {/* Promo Code Section */}
          {!isApplication && (
            <div className="mb-6">
              {!usePromoCode ? (
                <button
                  onClick={() => setUsePromoCode(true)}
                  className="flex items-center gap-2 text-secondary hover:underline text-sm w-full justify-center"
                >
                  <Gift className="w-4 h-4" />
                  Have a promo code?
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                  <p className="text-sm text-foreground mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-secondary" />
                    Enter your promo code for free access
                  </p>
                  <PromoCodeInput onValidCode={setValidPromoCode} />
                  {!validPromoCode && (
                    <button
                      onClick={() => setUsePromoCode(false)}
                      className="text-xs text-muted-foreground hover:text-foreground mt-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

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

            {/* Referral Code (Optional) */}
            {!isApplication && !usePromoCode && (
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="referralCode"
                    name="referralCode"
                    placeholder="e.g. ALPHA-XXXX"
                    value={formData.referralCode}
                    onChange={(e) => {
                      handleInputChange(e);
                      setReferralStatus("idle");
                      setReferralMessage("");
                    }}
                    className={`uppercase flex-1 ${
                      referralStatus === "valid" ? "border-secondary" :
                      referralStatus === "invalid" ? "border-destructive" : ""
                    }`}
                    disabled={referralStatus === "valid" || referralStatus === "checking"}
                  />
                  <Button
                    type="button"
                    variant="sage"
                    size="sm"
                    onClick={checkReferralCode}
                    disabled={!formData.referralCode.trim() || referralStatus === "valid" || referralStatus === "checking"}
                  >
                    {referralStatus === "checking" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : referralStatus === "valid" ? (
                      "✓"
                    ) : (
                      "Check"
                    )}
                  </Button>
                </div>
                {referralMessage && (
                  <p className={`text-xs ${referralStatus === "valid" ? "text-secondary" : "text-destructive"}`}>
                    {referralMessage}
                  </p>
                )}
              </div>
            )}
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
            isApplication ? "Submit Application" : 
            validPromoCode ? "Complete Signup" : "Continue to Payment"
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