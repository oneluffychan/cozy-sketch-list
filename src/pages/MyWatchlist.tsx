import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Clock, Play, CheckCircle2, Sparkles } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";

interface WatchlistItem {
  id: string;
  anime_id: number;
  anime_title: string;
  anime_title_japanese: string | null;
  anime_image: string | null;
  status: string;
  episodes_watched: number | null;
  total_episodes: number | null;
  rating: number | null;
  notes: string | null;
  added_date: string | null;
  updated_date: string | null;
}

const MyWatchlist = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchWatchlist = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_date", { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error: any) {
      toast.error("Error fetching watchlist");
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchWatchlist();

      const channel = supabase
        .channel("watchlist_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "watchlist",
            filter: `user_id=eq.${session.user.id}`,
          },
          () => {
            fetchWatchlist();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session?.user?.id]);

  const getAnimeByStatus = (status: string) => {
    return watchlist.filter((item) => item.status === status);
  };

  const watchLater = getAnimeByStatus("watch-later");
  const watching = getAnimeByStatus("watching");
  const completed = getAnimeByStatus("completed");

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
      <header className="bg-card border-b-2 border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-handwritten">My Watchlist 📺</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="watch-later" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="watch-later" className="font-doodle">
              <Clock className="w-4 h-4 mr-2" />
              Watch Later ({watchLater.length})
            </TabsTrigger>
            <TabsTrigger value="watching" className="font-doodle">
              <Play className="w-4 h-4 mr-2" />
              Watching ({watching.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="font-doodle">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watch-later">
            {watchLater.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No anime in your watch later list</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {watchLater.map((item) => (
                  <AnimeCard
                    key={item.id}
                    anime={{
                      id: item.id,
                      anime_id: item.anime_id,
                      anime_title: item.anime_title,
                      anime_title_japanese: item.anime_title_japanese || undefined,
                      anime_image: item.anime_image || undefined,
                      status: item.status,
                      episodes_watched: item.episodes_watched || 0,
                      total_episodes: item.total_episodes || undefined,
                      rating: item.rating || undefined,
                      notes: item.notes || undefined,
                    }}
                    currentStatus={item.status}
                    onUpdate={fetchWatchlist}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="watching">
            {watching.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No anime currently watching</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {watching.map((item) => (
                  <AnimeCard
                    key={item.id}
                    anime={{
                      id: item.id,
                      anime_id: item.anime_id,
                      anime_title: item.anime_title,
                      anime_title_japanese: item.anime_title_japanese || undefined,
                      anime_image: item.anime_image || undefined,
                      status: item.status,
                      episodes_watched: item.episodes_watched || 0,
                      total_episodes: item.total_episodes || undefined,
                      rating: item.rating || undefined,
                      notes: item.notes || undefined,
                    }}
                    currentStatus={item.status}
                    onUpdate={fetchWatchlist}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completed.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No completed anime yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {completed.map((item) => (
                  <AnimeCard
                    key={item.id}
                    anime={{
                      id: item.id,
                      anime_id: item.anime_id,
                      anime_title: item.anime_title,
                      anime_title_japanese: item.anime_title_japanese || undefined,
                      anime_image: item.anime_image || undefined,
                      status: item.status,
                      episodes_watched: item.episodes_watched || 0,
                      total_episodes: item.total_episodes || undefined,
                      rating: item.rating || undefined,
                      notes: item.notes || undefined,
                    }}
                    currentStatus={item.status}
                    onUpdate={fetchWatchlist}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyWatchlist;
