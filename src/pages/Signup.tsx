import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SignupWizard from "@/components/SignupWizard";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import logoLight from "@/assets/alpha-logo-light.png";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") || "free";
  const isApplication = searchParams.get("apply") === "true";

  const tierNames: Record<string, string> = {
    free: "Free",
    essential: "Essential",
    elite: "Elite",
    private: "Private",
  };

  return (
    <>
      <Helmet>
        <title>Join Alpha | {tierNames[tier] || "Signup"}</title>
        <meta name="description" content="Create your Alpha account and join the movement." />
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
          <div className="w-full max-w-lg">
            {/* Tier Badge */}
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium">
                {isApplication ? "Private Application" : `${tierNames[tier]} Tier`}
              </span>
            </div>

            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8">
              <SignupWizard tier={tier} isApplication={isApplication} />
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-secondary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Signup;
