import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TierSection from "@/components/TierSection";
import Philosophy from "@/components/Philosophy";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Alpha Appeal | South Africa's Premium Cannabis Lifestyle Subscription</title>
        <meta 
          name="description" 
          content="Join South Africa's most exclusive cannabis lifestyle community. Curated products, premium experiences, and a community of tastemakers. 18+ only." 
        />
        <meta name="keywords" content="cannabis, lifestyle, subscription, South Africa, premium, luxury" />
        <meta property="og:title" content="Alpha Appeal | Premium Cannabis Lifestyle" />
        <meta property="og:description" content="Join South Africa's most exclusive cannabis lifestyle community. Curated products, premium experiences." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://alpha-appeal.co.za" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <TierSection />
          <Philosophy />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
