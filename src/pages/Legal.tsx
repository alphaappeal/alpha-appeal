import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, FileText, Lock, Mail, AlertTriangle, Info, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Legal = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Legal | Terms & Privacy | Alpha Appeal</title>
        <meta name="description" content="Alpha Appeal Terms & Conditions, Privacy Policy, and Legal Disclaimers. Read our policies on data collection, user responsibilities, and more." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Header */}
          <div className="bg-gradient-to-b from-card to-background py-16 border-b border-border/30">
            <div className="container mx-auto px-4 text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Legal Information
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
                Terms & Conditions, Privacy Policy, and User Agreements
              </p>
              <p className="text-sm text-muted-foreground">
                Last Updated: January 21, 2026
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border/30 py-4">
            <div className="container mx-auto px-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => scrollToSection('terms')}
                  className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-all whitespace-nowrap text-sm text-foreground"
                >
                  <FileText className="w-4 h-4 text-secondary" />
                  Terms & Conditions
                </button>
                <button
                  onClick={() => scrollToSection('privacy')}
                  className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-all whitespace-nowrap text-sm text-foreground"
                >
                  <Lock className="w-4 h-4 text-secondary" />
                  Privacy Policy
                </button>
                <button
                  onClick={() => scrollToSection('disclaimer')}
                  className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-all whitespace-nowrap text-sm text-foreground"
                >
                  <AlertTriangle className="w-4 h-4 text-secondary" />
                  Disclaimers
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-lg transition-all whitespace-nowrap text-sm text-foreground"
                >
                  <Mail className="w-4 h-4 text-secondary" />
                  Contact
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            
            {/* Critical Disclaimers Banner */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 mb-12">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Important Legal Notices</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>21+ Only:</strong> You must be of legal age to view cannabis information in your jurisdiction</p>
                    <p>• <strong>Not Medical Advice:</strong> Information is educational only and not a substitute for professional medical advice</p>
                    <p>• <strong>FDA Disclaimer:</strong> Statements have not been evaluated by the FDA</p>
                    <p>• <strong>No Sales:</strong> We do not sell cannabis or facilitate transactions</p>
                    <p>• <strong>Your Responsibility:</strong> Comply with all local laws regarding cannabis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TERMS AND CONDITIONS */}
            <section id="terms" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground">Terms and Conditions</h2>
              </div>

              <div className="prose prose-invert max-w-none space-y-8">
                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h3>
                  <p className="text-muted-foreground">
                    By accessing or using Alpha Appeal ("the Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, you must immediately cease use of the Platform.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">2. Age Requirement ⚠️</h3>
                  <p className="text-destructive font-semibold mb-4">
                    YOU MUST BE AT LEAST 21 YEARS OF AGE OR THE LEGAL AGE IN YOUR JURISDICTION TO ACCESS THIS PLATFORM.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    By using Alpha Appeal, you represent and warrant that you are of legal age to view cannabis-related information in your state, province, or country. We reserve the right to request proof of age at any time.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Parental Responsibility:</strong> If you believe your minor child has accessed this Platform, contact us immediately at legal@alphaappeal.com.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">3. Informational Purpose Only</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">3.1 Educational Content</h4>
                      <p className="text-muted-foreground">
                        All cannabis strain information, descriptions, effects, THC/CBD levels, and related content is for educational and informational purposes only.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">3.2 Not Medical Advice</h4>
                      <p className="text-destructive font-medium mb-2">
                        THE INFORMATION PROVIDED IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT.
                      </p>
                      <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• We do not diagnose, treat, cure, or prevent any disease</li>
                        <li>• Always seek advice of qualified health professionals</li>
                        <li>• Never disregard medical advice based on Platform information</li>
                        <li>• Call emergency services for medical emergencies</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">3.3 FDA Disclaimer</h4>
                      <p className="text-destructive font-medium mb-2">
                        THESE STATEMENTS HAVE NOT BEEN EVALUATED BY THE FOOD AND DRUG ADMINISTRATION (FDA).
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Products or substances referenced are not intended to diagnose, treat, cure, or prevent any disease.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">4. No E-Commerce or Transactions</h3>
                  <p className="text-muted-foreground mb-4">
                    Alpha Appeal is a content and information platform only. We do not:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-destructive">✗ Sell cannabis products</div>
                    <div className="flex items-center gap-2 text-destructive">✗ Facilitate cannabis transactions</div>
                    <div className="flex items-center gap-2 text-destructive">✗ Process payments for cannabis</div>
                    <div className="flex items-center gap-2 text-destructive">✗ Arrange delivery or distribution</div>
                    <div className="flex items-center gap-2 text-destructive">✗ Act as marketplace or intermediary</div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Store locations represent Alpha Appeal lifestyle retail offering fashion, accessories, and curated experiences only.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">5. User Responsibilities & Legal Compliance</h3>
                  <p className="text-destructive font-medium mb-4">
                    YOU ARE SOLELY RESPONSIBLE FOR ENSURING YOUR USE COMPLIES WITH ALL APPLICABLE LAWS.
                  </p>
                  <p className="text-muted-foreground mb-4">Cannabis laws vary by jurisdiction. You must:</p>
                  <ul className="text-muted-foreground space-y-2">
                    <li>→ Understand laws in your location</li>
                    <li>→ Ensure access to cannabis information is legal</li>
                    <li>→ Comply with all regulations</li>
                    <li>→ Not use information for illegal activities</li>
                  </ul>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">6. Limitation of Liability</h3>
                  <p className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground mb-4">
                    THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, Alpha Appeal shall not be liable for:
                  </p>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Loss of profits or data</li>
                    <li>• Personal injury or property damage</li>
                    <li>• Legal consequences of cannabis use</li>
                    <li>• Adverse reactions or health effects</li>
                    <li>• Reliance on Platform information</li>
                    <li>• Third-party actions</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    <strong>Maximum Liability:</strong> Our total liability shall not exceed $100 USD.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">7. Governing Law</h3>
                  <p className="text-muted-foreground">
                    These Terms shall be governed by the laws of South Africa. Disputes shall be resolved through binding arbitration in accordance with AFSA rules.
                  </p>
                </div>
              </div>
            </section>

            {/* PRIVACY POLICY */}
            <section id="privacy" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-secondary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground">Privacy Policy</h2>
              </div>

              <div className="space-y-8">
                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h3>
                  <p className="text-muted-foreground mb-4">
                    Alpha Appeal respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
                  </p>
                  <p className="text-muted-foreground">
                    By using Alpha Appeal, you consent to the data practices described in this policy.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h3>
                  <div className="grid gap-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">2.1 Information You Provide</h4>
                      <p className="text-muted-foreground text-sm">We collect information when you create an account (email, name), use promo codes, submit vendor location suggestions, or contact support.</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">2.2 Automatically Collected</h4>
                      <p className="text-muted-foreground text-sm">IP address, browser type, device info, access times, pages viewed, referring sites.</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">2.3 Cookies</h4>
                      <p className="text-muted-foreground text-sm">We use cookies to maintain sessions, remember preferences, and analyze usage. You can control cookies through browser settings.</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">2.4 Location Data</h4>
                      <p className="text-muted-foreground text-sm">Approximate location (city/region) for store locations and location-based content. We do not collect precise GPS without permission.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">3. How We Use Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Platform Functionality</h4>
                      <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• Account management</li>
                        <li>• Promo code processing</li>
                        <li>• Personalized content</li>
                      </ul>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Communication</h4>
                      <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• Transactional emails</li>
                        <li>• Support responses</li>
                        <li>• Platform updates</li>
                      </ul>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Analytics</h4>
                      <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• Usage analysis</li>
                        <li>• Platform improvement</li>
                        <li>• Technical troubleshooting</li>
                      </ul>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Legal & Security</h4>
                      <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• Legal compliance</li>
                        <li>• Terms enforcement</li>
                        <li>• Fraud protection</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">4. Supabase as Our Database Provider</h3>
                  <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                    <p className="text-muted-foreground mb-4">
                      We use Supabase as our secure, enterprise-grade database and authentication provider.
                    </p>
                    <h4 className="font-semibold text-foreground mb-2">Security Measures:</h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• SSL/TLS encryption for data in transit</li>
                      <li>• Encryption at rest for stored data</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls and authentication</li>
                      <li>• Automated backups</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      Supabase Privacy Policy: <a href="https://supabase.com/privacy" className="text-secondary hover:underline" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">5. Data Sharing & Disclosure</h3>
                  <p className="text-secondary font-semibold mb-4">✓ WE DO NOT SELL YOUR DATA</p>
                  <p className="text-muted-foreground mb-4">
                    Alpha Appeal does not sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                  <p className="text-muted-foreground mb-2">We may share data with:</p>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• <strong>Service Providers:</strong> Supabase, email delivery, analytics (contractually obligated to protect data)</li>
                    <li>• <strong>Legal Requirements:</strong> Court orders, government requests, legal compliance</li>
                    <li>• <strong>Business Transfers:</strong> Mergers or acquisitions (with notice)</li>
                    <li>• <strong>Aggregate Data:</strong> Anonymized data for research (does not identify individuals)</li>
                  </ul>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">6. Your Privacy Rights</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Access & Portability</h4>
                      <p className="text-muted-foreground text-sm">Request a copy of your data in portable format</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Correction</h4>
                      <p className="text-muted-foreground text-sm">Update or correct inaccurate information</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Deletion</h4>
                      <p className="text-muted-foreground text-sm">Request account and data deletion</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Opt-Out</h4>
                      <p className="text-muted-foreground text-sm">Unsubscribe from communications, disable cookies</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    To exercise these rights: <a href="mailto:legal@alphaappeal.com" className="text-secondary hover:underline">legal@alphaappeal.com</a>
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">7. Children's Privacy</h3>
                  <p className="text-destructive font-semibold mb-4">
                    Alpha Appeal is NOT intended for individuals under 21.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    We do not knowingly collect data from minors. If we discover a minor has provided data, we will delete the information immediately, terminate the account, and take measures to prevent future access.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Parents/Guardians: If you believe your child accessed the Platform, contact <a href="mailto:legal@alphaappeal.com" className="text-destructive hover:underline">legal@alphaappeal.com</a>
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">8. Data Security</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Technical Safeguards</h4>
                      <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• SSL/TLS encryption</li>
                        <li>• Secure authentication</li>
                        <li>• Regular security audits</li>
                        <li>• Firewall protection</li>
                      </ul>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Organizational</h4>
                      <ul className="text-muted-foreground text-sm space-y-1">
                        <li>• Employee training</li>
                        <li>• Limited data access</li>
                        <li>• Confidentiality agreements</li>
                        <li>• Incident response</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    ⚠️ No method of transmission or storage is 100% secure. While we strive to protect data, we cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </section>

            {/* ADDITIONAL DISCLAIMERS */}
            <section id="disclaimer" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground">Additional Disclaimers</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">⚕️ Medical Disclaimer</h3>
                  <p className="text-muted-foreground mb-4">
                    This platform does not provide medical advice. All content is for informational purposes only and is not intended to replace consultation with qualified healthcare professionals.
                  </p>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Cannabis may interact with medications - consult your doctor</li>
                    <li>• Effects vary by individual, dosage, and method of consumption</li>
                    <li>• Not recommended during pregnancy or breastfeeding</li>
                    <li>• May impair ability to drive or operate machinery</li>
                    <li>• Potential for dependency in some individuals</li>
                  </ul>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">⚖️ Legal Disclaimer</h3>
                  <p className="text-muted-foreground mb-4">Cannabis laws vary by jurisdiction. It is your responsibility to:</p>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Verify the legality of cannabis in your location</li>
                    <li>• Understand possession, cultivation, and use limits</li>
                    <li>• Comply with age restrictions and licensing requirements</li>
                    <li>• Not transport cannabis across state or international borders where prohibited</li>
                    <li>• Understand employment and housing implications</li>
                  </ul>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/30">
                  <h3 className="text-xl font-semibold text-foreground mb-4">📊 Data Accuracy Disclaimer</h3>
                  <p className="text-muted-foreground">
                    Strain data (THC/CBD levels, effects, terpenes) is sourced from publicly available databases including Leafly.com. 
                    Actual products may vary based on growing conditions, testing methods, and batches. Always verify information with licensed dispensaries and laboratories.
                  </p>
                </div>
              </div>
            </section>

            {/* CONTACT INFORMATION */}
            <section id="contact" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-secondary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground">Contact Us</h2>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border/30">
                <p className="text-muted-foreground mb-6">
                  For questions, concerns, or requests regarding these legal documents or your data:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">General Legal Inquiries</h4>
                    <p className="text-secondary">legal@alphaappeal.com</p>
                    <p className="text-muted-foreground text-sm">Response time: 14 business days</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Data Protection Officer</h4>
                    <p className="text-secondary">dpo@alphaappeal.com</p>
                    <p className="text-muted-foreground text-sm">For privacy-specific concerns</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Mailing Address</h4>
                    <p className="text-muted-foreground text-sm">Alpha Appeal</p>
                    <p className="text-muted-foreground text-sm">Cape Town, Western Cape</p>
                    <p className="text-muted-foreground text-sm">South Africa</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">User Support</h4>
                    <p className="text-secondary">support@alphaappeal.com</p>
                    <p className="text-muted-foreground text-sm">For Platform assistance</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border/30 text-center">
                  <p className="text-muted-foreground text-sm">
                    Document Version: 1.0 | Last Reviewed: January 21, 2026
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Footer Note */}
          <div className="bg-muted/30 py-8 border-t border-border/30">
            <div className="container mx-auto px-4 text-center">
              <p className="text-muted-foreground text-sm">
                By continuing to use Alpha Appeal, you acknowledge acceptance of these terms and policies.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Legal;
