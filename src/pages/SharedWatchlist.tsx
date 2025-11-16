import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";

interface WatchlistItem {
  id: string;
  anime_id: number;
  anime_title: string;
  anime_image: string | null;
  anime_title_japanese: string | null;
  notes: string | null;
}

interface Watchlist {
  id: string;
  name: string;
  description: string | null;
}

const SharedWatchlist = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchSharedWatchlist();
    }
  }, [token]);

  const fetchSharedWatchlist = async () => {
    try {
      const { data: watchlistData, error: watchlistError } = await supabase
        .from("custom_watchlists")
        .select("id, name, description")
        .eq("share_token", token)
        .eq("is_public", true)
        .single();

      if (watchlistError) throw watchlistError;

      setWatchlist(watchlistData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("custom_watchlist_items")
        .select("*")
        .eq("watchlist_id", watchlistData.id)
        .order("added_at", { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching shared watchlist:", error);
      toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-anime-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anime-purple mx-auto mb-4"></div>
          <p className="text-anime-purple font-doodle">Loading...</p>
        </div>
      </div>
    );
  }

  if (!watchlist) {
    return (
      <div className="min-h-screen bg-anime-cream flex items-center justify-center">
        <Card className="card-sketchy p-8 text-center">
          <CardContent>
            <p className="text-gray-600 font-doodle mb-4">
              Watchlist not found or not public
            </p>
            <Button onClick={() => navigate("/")} className="btn-doodle">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anime-cream p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
            className="btn-doodle"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-marker text-4xl text-anime-purple mb-1">
              {watchlist.name}
            </h1>
            {watchlist.description && (
              <p className="text-gray-600 font-doodle">{watchlist.description}</p>
            )}
            <p className="text-sm text-gray-500 font-doodle mt-2">
              📺 Shared Watchlist • {items.length} anime
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="card-sketchy text-center p-12">
            <CardContent>
              <p className="text-gray-600 font-doodle">
                This watchlist is empty!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <AnimeCard
                key={item.id}
                anime={{
                  anime_id: item.anime_id,
                  anime_title: item.anime_title,
                  anime_image: item.anime_image,
                  anime_title_japanese: item.anime_title_japanese,
                  status: "watch_later",
                  episodes_watched: 0,
                  total_episodes: 0,
                  notes: item.notes,
                }}
                showAddButton={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedWatchlist;