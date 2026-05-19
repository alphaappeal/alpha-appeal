import { Helmet } from "react-helmet-async";
import { Instagram, Music, Play, Disc } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const links = [
  {
    title: "Instagram",
    url: "https://www.instagram.com/alphaappeal/",
    icon: Instagram,
    color: "hover:bg-pink-500/10 hover:border-pink-500/50 hover:text-pink-500",
  },
  {
    title: "Apple Music",
    url: "https://music.apple.com/za/artist/alpha-appeal/1646084108",
    icon: Music,
    color: "hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500",
  },
  {
    title: "Spotify",
    url: "https://open.spotify.com/playlist/37i9dQZF1E4y5BvNwgdbsY?si=dbc24a5248dd44f4",
    icon: Play,
    color: "hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500",
  },
  {
    title: "Soundcloud",
    url: "https://soundcloud.com/user-798481873",
    icon: Disc,
    color: "hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-500",
  },
];

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Connect With Us | Alpha Appeal</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Connect With Alpha</h1>
              <p className="text-muted-foreground text-lg">Follow our journey, listen to our curated sounds, and stay updated across all platforms.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 p-6 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${link.color} group`}
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-transparent transition-colors">
                    <link.icon className="w-6 h-6" />
                  </div>
                  <span className="font-display text-xl font-medium">{link.title}</span>
                </a>
              ))}
            </div>

            <div className="mt-16 text-center">
              <h2 className="font-display text-2xl font-semibold mb-4">General Inquiries</h2>
              <p className="text-muted-foreground mb-6">For partnerships, support, or general questions, please reach out via email.</p>
              <a href="mailto:hello@alphaappeal.co.za" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 transition-colors">
                Email Us
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
