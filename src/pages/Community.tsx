import { Helmet } from "react-helmet-async";
import BottomNav from "@/components/BottomNav";
import { Users, MessageCircle, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logoLight from "@/assets/alpha-logo-light.png";

const Community = () => {
  const discussions = [
    { id: 1, title: "Best accessories for daily rituals?", replies: 23, author: "Themba M.", time: "2h ago" },
    { id: 2, title: "January kit unboxing thread", replies: 45, author: "Sarah K.", time: "5h ago" },
    { id: 3, title: "Wellness tips for the new year", replies: 12, author: "Mike O.", time: "1d ago" },
  ];

  const events = [
    { id: 1, title: "Virtual Wellness Session", date: "Jan 22", spots: "28 spots left" },
    { id: 2, title: "JHB Members Meetup", date: "Feb 5", spots: "Limited" },
  ];

  return (
    <>
      <Helmet>
        <title>Community | Alpha</title>
        <meta name="description" content="Connect with the Alpha community." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-7" />
            </Link>
            <h1 className="font-display text-lg font-semibold text-foreground">Community</h1>
            <div className="w-14" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Users className="w-10 h-10 text-secondary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              The Movement
            </h2>
            <p className="text-muted-foreground">
              Connect with lifestyle enthusiasts
            </p>
          </div>

          {/* Upcoming Events */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-secondary" />
              <h3 className="font-display text-lg font-semibold text-foreground">Upcoming Events</h3>
            </div>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30"
                >
                  <div>
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    <p className="text-muted-foreground text-sm">{event.date}</p>
                  </div>
                  <span className="text-secondary text-xs font-medium">{event.spots}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Discussions */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-secondary" />
              <h3 className="font-display text-lg font-semibold text-foreground">Recent Discussions</h3>
            </div>
            <div className="space-y-3">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="p-4 rounded-xl border border-border/50 bg-card/30 hover:border-secondary/50 transition-all cursor-pointer"
                >
                  <h4 className="font-medium text-foreground mb-2">{discussion.title}</h4>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{discussion.author}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {discussion.replies}
                      </span>
                      <span>{discussion.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 text-center">
            <Heart className="w-8 h-8 text-secondary mx-auto mb-3" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Full Community Coming Soon
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Forums, direct messaging, and more
            </p>
            <Button variant="glass" size="sm">
              Get Early Access
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Community;
