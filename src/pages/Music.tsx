import { Helmet } from "react-helmet-async";
import BottomNav from "@/components/BottomNav";
import { Music as MusicIcon, Play, Lock, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logoLight from "@/assets/alpha-logo-light.png";

const Music = () => {
  const playlists = [
    { id: 1, name: "Morning Ritual", tracks: 24, duration: "1h 45m", locked: false },
    { id: 2, name: "Focus Flow", tracks: 18, duration: "1h 12m", locked: false },
    { id: 3, name: "Evening Unwind", tracks: 32, duration: "2h 08m", locked: false },
    { id: 4, name: "Elite Sessions Vol. 1", tracks: 40, duration: "3h 22m", locked: true },
  ];

  return (
    <>
      <Helmet>
        <title>Music | Alpha</title>
        <meta name="description" content="Curated playlists for elevated living." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-7" />
            </Link>
            <h1 className="font-display text-lg font-semibold text-foreground">Music</h1>
            <div className="w-14" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Headphones className="w-10 h-10 text-secondary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Curated Sounds
            </h2>
            <p className="text-muted-foreground">
              Playlists designed for intentional living
            </p>
          </div>

          <div className="space-y-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  playlist.locked
                    ? "opacity-60 border-border/30 bg-card/20"
                    : "border-border/50 bg-card/30 hover:border-secondary/50"
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  playlist.locked ? "bg-muted/30" : "bg-secondary/10"
                }`}>
                  {playlist.locked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Play className="w-5 h-5 text-secondary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{playlist.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {playlist.tracks} tracks • {playlist.duration}
                  </p>
                </div>
                {playlist.locked && (
                  <span className="px-2 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium">
                    Elite
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-card/50 border border-secondary/30 text-center">
            <MusicIcon className="w-8 h-8 text-secondary mx-auto mb-3" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Spotify Integration Coming
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Soon you'll be able to stream directly in-app
            </p>
            <Button variant="sage" size="sm">
              Connect Spotify
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Music;
