import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => {
  return (
    <>
      <Helmet>
        <title>{title} | Alpha Appeal</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32 pb-20">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">{title}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PlaceholderPage;
