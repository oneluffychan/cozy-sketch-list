import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";
import AnimeCard from "./AnimeCard";

interface Anime {
  mal_id: number;
  title: string;
  title_japanese?: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  episodes?: number;
  score?: number;
  year?: number;
  synopsis?: string;
}

const AnimeSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch anime");
      }

      const data = await response.json();
      setResults(data.data || []);
      
      if (data.data.length === 0) {
        toast.info("No anime found. Try a different search!");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search anime. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for anime... 🔍"
          className="btn-doodle font-doodle"
        />
        <Button
          type="submit"
          disabled={loading}
          className="btn-doodle bg-primary hover:bg-primary/90 font-doodle"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              anime={{
                anime_id: anime.mal_id,
                anime_title: anime.title,
                anime_title_japanese: anime.title_japanese,
                anime_image: anime.images.jpg.large_image_url,
                total_episodes: anime.episodes,
                status: "watch_later",
              }}
              showAddButton
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimeSearch;
