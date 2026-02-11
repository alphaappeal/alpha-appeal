import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import TierSection from "@/components/TierSection";
import SocialProof from "@/components/SocialProof";
import Philosophy from "@/components/Philosophy";
import MemberNetwork from "@/components/MemberNetwork";
import Footer from "@/components/Footer";
import ConsentModal from "@/components/ConsentModal";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Alpha Appeal | Live with Intention. Move with Culture.</title>
        <meta 
          name="description" 
          content="Join South Africa's most intentional lifestyle movement. Art you can wear. Music you can live in. Culture you can feel. Premium curated experiences delivered monthly." 
        />
        <meta name="keywords" content="lifestyle, subscription, South Africa, premium, luxury, music, fashion, wellness, culture" />
        <meta property="og:title" content="Alpha Appeal | Premium Lifestyle Movement" />
        <meta property="og:description" content="Art you can wear. Music you can live in. Culture you can feel. Join the movement." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://alpha-appeal.co.za" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <HowItWorks />
          <TierSection />
          <MemberNetwork />
          <SocialProof />
          <Philosophy />
        </main>
        <Footer />
        <ConsentModal />
      </div>
    </>
  );
};

export default Index;
