import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimeCard from "./AnimeCard";
import { Tv, Eye, CheckCircle } from "lucide-react";

interface WatchlistItem {
  id: string;
  anime_id: number;
  anime_title: string;
  anime_title_japanese?: string;
  anime_image?: string;
  total_episodes?: number;
  episodes_watched?: number;
  status: string;
  rating?: number;
  notes?: string;
}

interface WatchlistSectionsProps {
  userId: string;
}

const WatchlistSections = ({ userId }: WatchlistSectionsProps) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", userId)
        .order("added_date", { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("watchlist-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watchlist",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchWatchlist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getAnimeByStatus = (status: string) => {
    return watchlist.filter((item) => item.status === status);
  };

  const watchLater = getAnimeByStatus("watch_later");
  const watching = getAnimeByStatus("watching");
  const completed = getAnimeByStatus("completed");

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-doodle text-lg">Loading your anime list... ✨</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="watch_later" className="w-full">
      <TabsList className="grid w-full grid-cols-3 card-sketchy p-1">
        <TabsTrigger
          value="watch_later"
          className="font-doodle data-[state=active]:bg-primary"
        >
          <Tv className="w-4 h-4 mr-2" />
          Watch Later ({watchLater.length})
        </TabsTrigger>
        <TabsTrigger
          value="watching"
          className="font-doodle data-[state=active]:bg-secondary"
        >
          <Eye className="w-4 h-4 mr-2" />
          Watching ({watching.length})
        </TabsTrigger>
        <TabsTrigger
          value="completed"
          className="font-doodle data-[state=active]:bg-accent"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Completed ({completed.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="watch_later" className="mt-6">
        {watchLater.length === 0 ? (
          <div className="text-center py-12 card-sketchy">
            <p className="font-doodle text-lg">
              No anime here yet! Start searching 🔍
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {watchLater.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} onUpdate={fetchWatchlist} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="watching" className="mt-6">
        {watching.length === 0 ? (
          <div className="text-center py-12 card-sketchy">
            <p className="font-doodle text-lg">
              Not watching anything yet! 👀
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {watching.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} onUpdate={fetchWatchlist} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="completed" className="mt-6">
        {completed.length === 0 ? (
          <div className="text-center py-12 card-sketchy">
            <p className="font-doodle text-lg">
              No completed anime yet! Keep watching ✅
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {completed.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} onUpdate={fetchWatchlist} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default WatchlistSections;
