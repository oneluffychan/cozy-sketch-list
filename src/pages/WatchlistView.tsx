import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Star } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";

interface WatchlistItem {
  id: string;
  anime_id: number;
  anime_title: string;
  anime_image: string | null;
  anime_title_japanese: string | null;
  notes: string | null;
  added_at: string;
}

interface Watchlist {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
}

const WatchlistView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchWatchlist();
    }
  }, [id]);

  const fetchWatchlist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user.id || null);

      const { data: watchlistData, error: watchlistError } = await supabase
        .from("custom_watchlists")
        .select("*")
        .eq("id", id)
        .single();

      if (watchlistError) throw watchlistError;

      setWatchlist(watchlistData);
      setIsOwner(session?.user.id === watchlistData.user_id);

      // Check if current user has saved this watchlist
      if (session?.user.id && session.user.id !== watchlistData.user_id) {
        const { data: savedData } = await supabase
          .from("saved_watchlists")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("watchlist_id", id)
          .maybeSingle();
        
        setIsSaved(!!savedData);
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from("custom_watchlist_items")
        .select("*")
        .eq("watchlist_id", id)
        .order("added_at", { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from("custom_watchlist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Anime removed from watchlist");
      fetchWatchlist();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove anime");
    }
  };

  const handleToggleSave = async () => {
    if (!currentUserId || isOwner) return;

    try {
      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from("saved_watchlists")
          .delete()
          .eq("user_id", currentUserId)
          .eq("watchlist_id", id);

        if (error) throw error;
        setIsSaved(false);
        toast.success("Removed from saved watchlists");
      } else {
        // Save
        const { error } = await supabase
          .from("saved_watchlists")
          .insert({
            user_id: currentUserId,
            watchlist_id: id,
          });

        if (error) throw error;
        setIsSaved(true);
        toast.success("Added to saved watchlists! ⭐");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast.error("Failed to update saved status");
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
            <p className="text-gray-600 font-doodle mb-4">Watchlist not found</p>
            <Button onClick={() => navigate("/watchlists")} className="btn-doodle">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anime-cream p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(isOwner ? "/watchlists" : "/dashboard")}
              className="btn-doodle"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-marker text-4xl text-anime-purple">{watchlist.name}</h1>
                {watchlist.is_public && (
                  <span className="text-xs bg-anime-purple text-white px-2 py-1 rounded-full">
                    Public
                  </span>
                )}
              </div>
            </div>
            {watchlist.description && (
              <p className="text-gray-600 font-doodle">{watchlist.description}</p>
            )}
          </div>
          {isOwner ? (
            <Button
              onClick={() => navigate("/dashboard")}
              className="btn-doodle"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Anime
            </Button>
          ) : currentUserId && (
            <Button
              onClick={handleToggleSave}
              className={isSaved ? "btn-doodle" : "btn-doodle-outline"}
              variant={isSaved ? "default" : "outline"}
            >
              <Star className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="card-sketchy text-center p-12">
            <CardContent>
              <p className="text-gray-600 font-doodle mb-4">
                No anime in this watchlist yet!
              </p>
              {isOwner && (
                <Button onClick={() => navigate("/dashboard")} className="btn-doodle">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Some Anime
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="relative">
                <AnimeCard
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
                {isOwner && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistView;