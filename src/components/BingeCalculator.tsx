import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WatchlistItem {
  id: string;
  anime_title: string;
  total_episodes?: number;
  episodes_watched?: number;
  status: string;
}

interface BingeCalculatorProps {
  userId: string;
}

const BingeCalculator = ({ userId }: BingeCalculatorProps) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<string>("all");
  const [episodeLength, setEpisodeLength] = useState<number>(24); // minutes

  useEffect(() => {
    const fetchWatchlist = async () => {
      const { data } = await supabase
        .from("watchlist")
        .select("id, anime_title, total_episodes, episodes_watched, status")
        .eq("user_id", userId);
      
      setWatchlist(data || []);
    };

    fetchWatchlist();
  }, [userId]);

  const calculateTime = () => {
    let totalEpisodes = 0;

    if (selectedAnime === "all") {
      // Calculate remaining episodes for all anime
      watchlist.forEach((anime) => {
        const remaining = (anime.total_episodes || 0) - (anime.episodes_watched || 0);
        totalEpisodes += remaining > 0 ? remaining : 0;
      });
    } else if (selectedAnime === "watching") {
      // Only currently watching
      watchlist
        .filter((anime) => anime.status === "watching")
        .forEach((anime) => {
          const remaining = (anime.total_episodes || 0) - (anime.episodes_watched || 0);
          totalEpisodes += remaining > 0 ? remaining : 0;
        });
    } else {
      // Specific anime
      const anime = watchlist.find((a) => a.id === selectedAnime);
      if (anime) {
        const remaining = (anime.total_episodes || 0) - (anime.episodes_watched || 0);
        totalEpisodes = remaining > 0 ? remaining : 0;
      }
    }

    const totalMinutes = totalEpisodes * episodeLength;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return { totalEpisodes, days, remainingHours, minutes };
  };

  const { totalEpisodes, days, remainingHours, minutes } = calculateTime();

  return (
    <div className="card-sketchy p-6 bg-card sticker">
      <h2 className="text-2xl font-handwritten mb-4 flex items-center gap-2">
        <Clock className="w-6 h-6 text-anime-purple" />
        Binge Calculator ⏰
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-doodle mb-2">
            Select Anime
          </label>
          <Select value={selectedAnime} onValueChange={setSelectedAnime}>
            <SelectTrigger className="btn-doodle font-doodle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌟 All Anime</SelectItem>
              <SelectItem value="watching">👀 Currently Watching</SelectItem>
              {watchlist.map((anime) => (
                <SelectItem key={anime.id} value={anime.id}>
                  {anime.anime_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-doodle mb-2">
            Episode Length (minutes)
          </label>
          <Select 
            value={episodeLength.toString()} 
            onValueChange={(val) => setEpisodeLength(Number(val))}
          >
            <SelectTrigger className="btn-doodle font-doodle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 min (Standard)</SelectItem>
              <SelectItem value="12">12 min (Short)</SelectItem>
              <SelectItem value="45">45 min (Long)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="mt-6 p-4 bg-anime-cream border-2 border-dashed border-anime-brown rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-anime-yellow" />
            <h3 className="font-handwritten text-xl">Time to Complete:</h3>
          </div>
          
          <div className="space-y-1 font-doodle">
            <p className="text-2xl text-anime-purple font-bold">
              {totalEpisodes} episodes remaining
            </p>
            
            {days > 0 && (
              <p className="text-lg">
                📅 {days} day{days !== 1 ? "s" : ""}{" "}
                {remainingHours > 0 && `${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`}
                {minutes > 0 && ` ${minutes} min`}
              </p>
            )}
            
            {days === 0 && remainingHours > 0 && (
              <p className="text-lg">
                ⏰ {remainingHours} hour{remainingHours !== 1 ? "s" : ""}{" "}
                {minutes > 0 && `${minutes} min`}
              </p>
            )}
            
            {days === 0 && remainingHours === 0 && minutes > 0 && (
              <p className="text-lg">⚡ {minutes} minutes</p>
            )}

            {totalEpisodes === 0 && (
              <p className="text-lg">✅ All caught up!</p>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-anime-brown/20 text-xs text-muted-foreground">
            💡 Tip: Watching 2 episodes per day = {Math.ceil(totalEpisodes / 2)} days
          </div>
        </div>
      </div>
    </div>
  );
};

export default BingeCalculator;
