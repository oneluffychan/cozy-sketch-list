import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Sparkles } from "lucide-react";
import AnimeSearch from "@/components/AnimeSearch";
import WatchlistSections from "@/components/WatchlistSections";
import BingeCalculator from "@/components/BingeCalculator";
import WatchScheduler from "@/components/WatchScheduler";

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out! See you soon 👋");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Error logging out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-bounce">
          <Sparkles className="w-12 h-12 text-anime-purple" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen paper-texture pb-8">
      {/* Header */}
      <header className="bg-card border-b-2 border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-handwritten wobble-hover inline-block">
            My Anime List 🌸
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="btn-doodle font-doodle"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <section className="card-sketchy p-6 bg-card">
          <h2 className="text-2xl font-handwritten mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-anime-purple" />
            Search Anime
          </h2>
          <AnimeSearch />
        </section>

        {/* Binge Calculator & Watch Scheduler */}
        <div className="grid lg:grid-cols-2 gap-6">
          <BingeCalculator userId={session.user.id} />
          <WatchScheduler userId={session.user.id} />
        </div>

        {/* Watchlist Sections */}
        <WatchlistSections userId={session.user.id} />
      </main>
    </div>
  );
};

export default Dashboard;
