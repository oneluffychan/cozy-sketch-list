import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface WatchlistItem {
  id: string;
  anime_title: string;
  anime_image?: string;
}

interface ScheduledSession {
  id: string;
  date: string;
  anime_id: string;
  anime_title: string;
}

interface WatchSchedulerProps {
  userId: string;
}

const WatchScheduler = ({ userId }: WatchSchedulerProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<string>("");
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch watchlist
      const { data: watchlistData } = await supabase
        .from("watchlist")
        .select("id, anime_title, anime_image")
        .eq("user_id", userId)
        .in("status", ["watch_later", "watching"]);
      
      setWatchlist(watchlistData || []);
    };

    fetchData();
  }, [userId]);

  const scheduledDates = scheduledSessions.map(
    (session) => new Date(session.date).toDateString()
  );

  const handleSchedule = async () => {
    if (!date || !selectedAnime) {
      toast.error("Please select both a date and anime!");
      return;
    }

    const anime = watchlist.find((a) => a.id === selectedAnime);
    if (!anime) return;

    // For now, just show a toast (we can add DB storage later if needed)
    toast.success(
      `Scheduled "${anime.anime_title}" for ${format(date, "MMMM d, yyyy")}! 📅✨`
    );
    
    setSelectedAnime("");
  };

  return (
    <div className="card-sketchy p-6 bg-card sticker">
      <h2 className="text-2xl font-handwritten mb-4 flex items-center gap-2">
        <CalendarDays className="w-6 h-6 text-anime-purple" />
        Watch Scheduler 📆
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="relative">
          <div className="absolute -top-2 -right-2 text-4xl animate-bounce">✨</div>
          <div className="absolute -bottom-2 -left-2 text-3xl">🌸</div>
          
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-2 border-anime-brown bg-anime-cream/30 pointer-events-auto"
            modifiers={{
              scheduled: (day) => scheduledDates.includes(day.toDateString()),
            }}
            modifiersStyles={{
              scheduled: { 
                backgroundColor: "hsl(var(--anime-purple))",
                color: "white",
                fontWeight: "bold",
              },
            }}
          />
        </div>

        {/* Scheduler Form */}
        <div className="space-y-4">
          <div className="relative p-4 bg-anime-cream border-2 border-dashed border-anime-brown rounded-lg">
            <div className="absolute -top-3 -right-3 text-2xl">⭐</div>
            <div className="absolute -bottom-2 left-4 text-2xl">💫</div>
            
            <h3 className="font-handwritten text-lg mb-3">
              Schedule a Watch Session
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-doodle mb-2">
                  Selected Date
                </label>
                <div className="btn-doodle bg-card p-2 text-center font-doodle">
                  {date ? format(date, "MMMM d, yyyy") : "Pick a date"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-doodle mb-2">
                  Choose Anime
                </label>
                <Select value={selectedAnime} onValueChange={setSelectedAnime}>
                  <SelectTrigger className="btn-doodle font-doodle">
                    <SelectValue placeholder="Select anime..." />
                  </SelectTrigger>
                  <SelectContent>
                    {watchlist.map((anime) => (
                      <SelectItem key={anime.id} value={anime.id}>
                        {anime.anime_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSchedule}
                className="w-full btn-doodle bg-primary hover:bg-primary/90 font-doodle"
                disabled={!date || !selectedAnime}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </div>
          </div>

          {/* Tips Section */}
          <div className="relative p-3 bg-anime-yellow/20 border-2 border-anime-yellow rounded-lg">
            <div className="absolute -top-2 -right-2">💡</div>
            <p className="text-xs font-doodle">
              <strong>Pro Tips:</strong>
              <br />
              • Schedule weekly anime nights 🍿
              <br />
              • Set reminders for new episodes
              <br />
              • Plan binge weekends! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchScheduler;
