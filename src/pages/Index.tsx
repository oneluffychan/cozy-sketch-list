import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Star, Tv } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 paper-texture relative overflow-hidden">
      {/* Floating doodles */}
      <div className="absolute top-10 left-10 animate-bounce sticker">
        <Star className="w-16 h-16 text-anime-yellow" fill="currentColor" />
      </div>
      <div className="absolute top-20 right-20 animate-pulse sticker">
        <Heart className="w-12 h-12 text-anime-pink" fill="currentColor" />
      </div>
      <div className="absolute bottom-20 left-20 wobble-hover sticker">
        <Sparkles className="w-14 h-14 text-anime-purple" fill="currentColor" />
      </div>
      <div className="absolute bottom-10 right-10 animate-bounce sticker">
        <Tv className="w-12 h-12 text-anime-blue" />
      </div>

      {/* Main Content */}
      <div className="text-center max-w-2xl z-10">
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-handwritten mb-4 wobble-hover inline-block">
            Anime Watchlist
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-anime-pink" fill="currentColor" />
            <Sparkles className="w-6 h-6 text-anime-purple" fill="currentColor" />
            <Star className="w-6 h-6 text-anime-yellow" fill="currentColor" />
          </div>
          <p className="text-xl md:text-2xl font-doodle text-muted-foreground">
            Your cozy companion for tracking anime adventures ✨
          </p>
        </div>

        <div className="card-sketchy p-8 bg-card mb-8 relative">
          <div className="absolute -top-4 -right-4 sticker">
            <Sparkles className="w-10 h-10 text-anime-purple" fill="currentColor" />
          </div>
          <p className="font-body text-lg mb-6">
            Keep track of what you want to watch, what you're watching, and what you've completed.
            All in one beautiful, hand-drawn space! 🌸
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
              size="lg"
              className="btn-doodle bg-primary hover:bg-primary/90 font-doodle text-lg"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started"}
            </Button>
            {!isLoggedIn && (
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                variant="outline"
                className="btn-doodle font-doodle text-lg"
              >
                Login
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-sketchy p-6 bg-card sticker">
            <Tv className="w-12 h-12 text-anime-blue mx-auto mb-3" />
            <h3 className="font-handwritten text-xl mb-2">Watch Later</h3>
            <p className="font-doodle text-sm text-muted-foreground">
              Save anime you want to watch
            </p>
          </div>
          <div className="card-sketchy p-6 bg-card sticker">
            <Heart className="w-12 h-12 text-anime-pink mx-auto mb-3" fill="currentColor" />
            <h3 className="font-handwritten text-xl mb-2">Currently Watching</h3>
            <p className="font-doodle text-sm text-muted-foreground">
              Track your progress
            </p>
          </div>
          <div className="card-sketchy p-6 bg-card sticker">
            <Star className="w-12 h-12 text-anime-yellow mx-auto mb-3" fill="currentColor" />
            <h3 className="font-handwritten text-xl mb-2">Completed</h3>
            <p className="font-doodle text-sm text-muted-foreground">
              Rate and remember
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
