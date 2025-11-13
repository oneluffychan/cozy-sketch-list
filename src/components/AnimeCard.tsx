import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Star, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AnimeCardProps {
  anime: {
    id?: string;
    anime_id: number;
    anime_title: string;
    anime_title_japanese?: string;
    anime_image?: string;
    total_episodes?: number;
    episodes_watched?: number;
    status: string;
    rating?: number;
    notes?: string;
  };
  showAddButton?: boolean;
  existingInWatchlist?: boolean;
  onUpdate?: () => void;
}

const AnimeCard = ({ anime, showAddButton, existingInWatchlist, onUpdate }: AnimeCardProps) => {
  const [status, setStatus] = useState(anime.status);
  const [episodesWatched, setEpisodesWatched] = useState(
    anime.episodes_watched || 0
  );
  const [rating, setRating] = useState(anime.rating || 0);
  const [notes, setNotes] = useState(anime.notes || "");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = async (selectedStatus: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first!");
        return;
      }

      const { error } = await supabase.from("watchlist").insert({
        user_id: session.user.id,
        anime_id: anime.anime_id,
        anime_title: anime.anime_title,
        anime_title_japanese: anime.anime_title_japanese,
        anime_image: anime.anime_image,
        total_episodes: anime.total_episodes,
        status: selectedStatus,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This anime is already in your list!");
        } else {
          throw error;
        }
      } else {
        toast.success(`Added to ${selectedStatus.replace("_", " ")}! ✨`);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error adding anime:", error);
      toast.error("Failed to add anime");
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("id", anime.id);

      if (error) throw error;
      toast.success("Removed from list!");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error deleting anime:", error);
      toast.error("Failed to remove anime");
    }
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("watchlist")
        .update({
          status,
          episodes_watched: episodesWatched,
          rating: rating > 0 ? rating : null,
          notes: notes.trim() || null,
        })
        .eq("id", anime.id);

      if (error) throw error;
      toast.success("Updated! ✨");
      setDialogOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating anime:", error);
      toast.error("Failed to update anime");
    }
  };

  return (
    <div className="card-sketchy p-4 bg-card hover:shadow-lg transition-all sticker">
      <div className="relative mb-3">
        {existingInWatchlist && (
          <div className="absolute top-2 right-2 bg-anime-purple text-white px-3 py-1 rounded-full text-xs font-doodle z-10 shadow-md">
            ✓ In List
          </div>
        )}
        <img
          src={anime.anime_image || "/placeholder.svg"}
          alt={anime.anime_title}
          className="w-full h-64 object-cover rounded-lg border-2 border-border"
        />
      </div>

      <h3 className="font-handwritten text-xl mb-1 line-clamp-2">
        {anime.anime_title}
      </h3>
      {anime.anime_title_japanese && (
        <p className="text-sm text-muted-foreground font-doodle mb-2">
          {anime.anime_title_japanese}
        </p>
      )}

      {!showAddButton && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-doodle">
              Episodes: {anime.episodes_watched || 0}
              {anime.total_episodes ? `/${anime.total_episodes}` : ""}
            </span>
          </div>
          {anime.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-anime-yellow" fill="currentColor" />
              <span className="text-sm font-doodle">{anime.rating}/10</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {showAddButton ? (
          <Select onValueChange={handleAdd}>
            <SelectTrigger className="btn-doodle font-doodle">
              <SelectValue placeholder="Add to..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="watch_later">📺 Watch Later</SelectItem>
              <SelectItem value="watching">👀 Watching</SelectItem>
              <SelectItem value="completed">✅ Completed</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="btn-doodle flex-1 font-doodle"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="card-sketchy">
                <DialogHeader>
                  <DialogTitle className="font-handwritten text-2xl">
                    Edit Details
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-doodle mb-2">
                      Status
                    </label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="btn-doodle">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="watch_later">
                          📺 Watch Later
                        </SelectItem>
                        <SelectItem value="watching">👀 Watching</SelectItem>
                        <SelectItem value="completed">✅ Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-doodle mb-2">
                      Episodes Watched
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={anime.total_episodes || 999}
                      value={episodesWatched}
                      onChange={(e) =>
                        setEpisodesWatched(parseInt(e.target.value) || 0)
                      }
                      className="btn-doodle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-doodle mb-2">
                      Rating (1-10)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                      className="btn-doodle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-doodle mb-2">
                      Notes
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="btn-doodle font-doodle"
                      placeholder="Your thoughts..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleUpdate}
                    className="w-full btn-doodle bg-primary hover:bg-primary/90 font-doodle"
                  >
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleDelete}
              variant="destructive"
              className="btn-doodle font-doodle"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AnimeCard;
